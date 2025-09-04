package com.ants.ktc.ants_ktc.controllers;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;

import com.ants.ktc.ants_ktc.dtos.chunkupload.CompleteRequestDto;
import com.ants.ktc.ants_ktc.dtos.chunkupload.InitRequestDto;
import com.ants.ktc.ants_ktc.models.ImageUploadMessage;
import com.ants.ktc.ants_ktc.services.RoomService;

@Controller
@RequestMapping("/api/upload")
public class ChunkUploadController {
    private final Path tempRoot;
    private final Path finalRoot;

    @Autowired
    private RoomService roomService;

    // Constructor
    public ChunkUploadController() {
        try {
            this.tempRoot = Paths.get(System.getProperty("java.io.tmpdir"), "chunks");

            // Use configurable upload directory or fallback to temp directory
            String uploadDir = System.getProperty("app.upload.directory",
                    System.getProperty("java.io.tmpdir") + "/uploads");
            this.finalRoot = Paths.get(uploadDir);

            Files.createDirectories(tempRoot);
            Files.createDirectories(finalRoot);
        } catch (IOException e) {
            throw new RuntimeException("Failed to create upload directories", e);
        }
    }

    @PostMapping(value = "/init", produces = MediaType.APPLICATION_JSON_VALUE, consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> init(@RequestBody InitRequestDto request) {
        // Validate required fields
        System.out.println("================== Request init: " + request + "============================");
        if (request.getFilename() == null || request.getFilename().trim().isEmpty()) {
            Map<String, Object> errorResp = new HashMap<>();
            errorResp.put("error", "Filename is required");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResp);
        }

        String uploadId = UUID.randomUUID().toString();
        Map<String, Object> resp = new HashMap<>();
        resp.put("uploadId", uploadId);
        resp.put("chunkSize", 2 * 1024 * 1024); // gợi ý 2MB
        resp.put("filename", request.getFilename());

        // Include optional parameters if provided
        if (request.getTotalChunks() != null) {
            resp.put("totalChunks", request.getTotalChunks());
        }
        if (request.getTotalSize() != null) {
            resp.put("totalSize", request.getTotalSize());
        }
        if (request.getFileHash() != null && !request.getFileHash().trim().isEmpty()) {
            resp.put("fileHash", request.getFileHash());
        }

        return ResponseEntity.ok(resp);
    }

    // Dùng để upload từng phần của file với hỗ trợ resume
    @PostMapping(value = "/chunk", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadChunk(
            @RequestParam(value = "uploadId") String uploadId,
            @RequestParam(value = "chunkIndex") int chunkIndex,
            @RequestParam(value = "totalChunks") int totalChunks,
            @RequestParam(value = "filename") String filename,
            @RequestPart("chunk") MultipartFile chunk,
            @RequestParam(value = "chunkHash", required = false) String chunkHash, // optional
            @RequestParam(value = "overwrite", required = false, defaultValue = "false") boolean overwrite // allow
                                                                                                           // overwriting
                                                                                                           // existing
    // chunks
    ) throws Exception {

        Path dir = tempRoot.resolve(uploadId);
        Files.createDirectories(dir);
        Path chunkPath = dir.resolve(String.format("%06d.part", chunkIndex));

        // Check if chunk already exists and handle accordingly
        if (Files.exists(chunkPath) && !overwrite) {
            Map<String, Object> resp = new HashMap<>();
            resp.put("message", "Chunk already exists");
            resp.put("chunkIndex", chunkIndex);
            resp.put("skipped", true);
            resp.put("existing_size", Files.size(chunkPath));
            return ResponseEntity.ok(resp);
        }

        // Verify chunk hash if provided
        if (chunkHash != null && !chunkHash.trim().isEmpty()) {
            String actualHash = calcSha256(chunk.getBytes());
            if (!chunkHash.equalsIgnoreCase(actualHash)) {
                Map<String, Object> errorResp = new HashMap<>();
                errorResp.put("error", "Chunk hash verification failed");
                errorResp.put("expected", chunkHash);
                errorResp.put("actual", actualHash);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResp);
            }
        }

        // Save chunk atomically
        Path tmp = Files.createTempFile(dir, "part-", ".tmp");
        try (InputStream in = chunk.getInputStream()) {
            Files.copy(in, tmp, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
        }
        Files.move(tmp, chunkPath, java.nio.file.StandardCopyOption.REPLACE_EXISTING,
                java.nio.file.StandardCopyOption.ATOMIC_MOVE);

        Map<String, Object> ok = new HashMap<>();
        ok.put("received", chunkIndex);
        ok.put("size", chunk.getSize());
        ok.put("filename", filename);
        ok.put("uploadId", uploadId);
        ok.put("progress", String.format("%.2f%%", ((chunkIndex + 1) * 100.0) / totalChunks));
        return ResponseEntity.ok(ok);
    }

    // Dùng để kiểm tra trạng thái upload và hỗ trợ resume
    @GetMapping(value = "/status", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> status(@RequestParam(value = "uploadId") String uploadId) {
        System.out.println("=== STATUS ENDPOINT CALLED ===");
        System.out.println("uploadId: " + uploadId);
        System.out.println("tempRoot: " + tempRoot.toAbsolutePath());

        if (uploadId == null || uploadId.trim().isEmpty()) {
            Map<String, Object> errorResp = new HashMap<>();
            errorResp.put("error", "Upload ID is required");
            System.out.println("ERROR: Upload ID is null or empty");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResp);
        }

        try {
            Path dir = tempRoot.resolve(uploadId);
            System.out.println("Upload directory: " + dir.toAbsolutePath());
            System.out.println("Directory exists: " + Files.exists(dir));
            System.out.println("Is directory: " + Files.isDirectory(dir));

            List<Integer> have = new ArrayList<>();
            long totalUploadedSize = 0;

            if (Files.isDirectory(dir)) {
                try (var s = Files.list(dir)) {
                    s.filter(p -> p.getFileName().toString().endsWith(".part"))
                            .forEach(p -> {
                                try {
                                    String name = p.getFileName().toString();
                                    int idx = Integer.parseInt(name.substring(0, 6));
                                    have.add(idx);
                                } catch (NumberFormatException e) {
                                    // Skip invalid chunk files
                                }
                            });
                }

                // Calculate total uploaded size
                for (Integer chunkIndex : have) {
                    Path chunkPath = dir.resolve(String.format("%06d.part", chunkIndex));
                    try {
                        totalUploadedSize += Files.size(chunkPath);
                    } catch (IOException e) {
                        // Chunk file might be corrupted, ignore for size calculation
                    }
                }
            }

            // Sort chunks for better readability
            have.sort(Integer::compareTo);

            Map<String, Object> resp = new HashMap<>();
            resp.put("uploadId", uploadId);
            resp.put("chunks", have);
            resp.put("totalChunks", have.size());
            resp.put("uploadedSize", totalUploadedSize);
            resp.put("canResume", !have.isEmpty());

            // Calculate missing chunks if we know the total expected
            // This would require storing metadata, for now just return what we have
            resp.put("status", have.isEmpty() ? "not_started" : "in_progress");

            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            Map<String, Object> errorResp = new HashMap<>();
            errorResp.put("error", "Failed to get upload status");
            errorResp.put("message", e.getMessage());
            return ResponseEntity.internalServerError().body(errorResp);
        }
    }

    // Endpoint to check missing chunks for resume functionality
    @GetMapping(value = "/resume", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> resume(
            @RequestParam(value = "uploadId") String uploadId,
            @RequestParam(value = "totalChunks") int totalChunks) {
        try {
            Path dir = tempRoot.resolve(uploadId);
            List<Integer> have = new ArrayList<>();
            List<Integer> missing = new ArrayList<>();

            if (Files.isDirectory(dir)) {
                try (var s = Files.list(dir)) {
                    s.filter(p -> p.getFileName().toString().endsWith(".part"))
                            .forEach(p -> {
                                try {
                                    String name = p.getFileName().toString();
                                    int idx = Integer.parseInt(name.substring(0, 6));
                                    have.add(idx);
                                } catch (NumberFormatException e) {
                                    // Skip invalid chunk files
                                }
                            });
                }
            }

            // Calculate missing chunks
            for (int i = 0; i < totalChunks; i++) {
                if (!have.contains(i)) {
                    missing.add(i);
                }
            }

            have.sort(Integer::compareTo);
            missing.sort(Integer::compareTo);

            Map<String, Object> resp = new HashMap<>();
            resp.put("uploadId", uploadId);
            resp.put("totalChunks", totalChunks);
            resp.put("completedChunks", have);
            resp.put("missingChunks", missing);
            resp.put("progress", String.format("%.2f%%", (have.size() * 100.0) / totalChunks));
            resp.put("canResume", true);
            resp.put("isComplete", missing.isEmpty());

            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            Map<String, Object> errorResp = new HashMap<>();
            errorResp.put("error", "Failed to get resume information");
            errorResp.put("message", e.getMessage());
            return ResponseEntity.internalServerError().body(errorResp);
        }
    }

    // Endpoint to cleanup abandoned uploads
    @PostMapping(value = "/cleanup", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> cleanup(@RequestParam(value = "uploadId") String uploadId) {
        try {
            Path dir = tempRoot.resolve(uploadId);

            if (!Files.isDirectory(dir)) {
                Map<String, Object> resp = new HashMap<>();
                resp.put("message", "Upload directory not found");
                resp.put("uploadId", uploadId);
                return ResponseEntity.ok(resp);
            }

            // Remove all chunk files
            int deletedFiles = 0;
            try (var s = Files.list(dir)) {
                for (Path p : s.toList()) {
                    try {
                        Files.deleteIfExists(p);
                        deletedFiles++;
                    } catch (IOException e) {
                        // Log warning but continue cleanup
                    }
                }
            }

            // Remove directory
            Files.deleteIfExists(dir);

            Map<String, Object> resp = new HashMap<>();
            resp.put("message", "Upload cleaned up successfully");
            resp.put("uploadId", uploadId);
            resp.put("deletedFiles", deletedFiles);
            return ResponseEntity.ok(resp);

        } catch (IOException e) {
            Map<String, Object> errorResp = new HashMap<>();
            errorResp.put("error", "Failed to cleanup upload");
            errorResp.put("message", e.getMessage());
            return ResponseEntity.internalServerError().body(errorResp);
        }
    }

    @PostMapping(value = "/complete", produces = MediaType.APPLICATION_JSON_VALUE, consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> complete(@RequestBody CompleteRequestDto request) {
        System.out.println("=== COMPLETE ENDPOINT CALLED ===");
        System.out.println("Request: " + request);
        try {
            // Validate required fields
            if (request.getUploadId() == null || request.getUploadId().trim().isEmpty()) {
                Map<String, Object> errorResp = new HashMap<>();
                errorResp.put("error", "Upload ID is required");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResp);
            }

            if (request.getFilename() == null || request.getFilename().trim().isEmpty()) {
                Map<String, Object> errorResp = new HashMap<>();
                errorResp.put("error", "Filename is required");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResp);
            }

            Path dir = tempRoot.resolve(request.getUploadId());
            System.out.println("Upload directory: " + dir.toAbsolutePath());
            System.out.println("Directory exists: " + Files.exists(dir));
            System.out.println("Is directory: " + Files.isDirectory(dir));

            if (!Files.isDirectory(dir)) {
                Map<String, Object> errorResp = new HashMap<>();
                errorResp.put("error", "Upload not found");
                errorResp.put("uploadId", request.getUploadId());
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResp);
            }

            // Merge chunks into final file
            Path finalPath = finalRoot.resolve(request.getFilename());
            System.out.println("Final path: " + finalPath.toAbsolutePath());
            System.out.println("Final directory exists: " + Files.exists(finalPath.getParent()));

            try (OutputStream out = Files.newOutputStream(finalPath)) {
                var parts = Files.list(dir)
                        .filter(p -> p.getFileName().toString().endsWith(".part"))
                        .sorted(Comparator.comparing(Path::getFileName))
                        .toList();

                System.out.println("Found " + parts.size() + " chunks to merge:");
                for (Path p : parts) {
                    System.out.println("  - " + p.getFileName() + " (" + Files.size(p) + " bytes)");
                }

                for (Path p : parts) {
                    Files.copy(p, out);
                }
                System.out.println("Chunks merged successfully");
            }

            // Verify whole file hash if provided
            if (request.getFileHash() != null && !request.getFileHash().trim().isEmpty()) {
                try {
                    String actualHash = sha256OfFile(finalPath);
                    if (!request.getFileHash().equalsIgnoreCase(actualHash)) {
                        Files.deleteIfExists(finalPath);
                        Map<String, Object> errorResp = new HashMap<>();
                        errorResp.put("error", "File hash verification failed");
                        errorResp.put("expected", request.getFileHash());
                        errorResp.put("actual", actualHash);
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResp);
                    }
                } catch (IOException e) {
                    Files.deleteIfExists(finalPath);
                    Map<String, Object> errorResp = new HashMap<>();
                    errorResp.put("error", "Failed to verify file hash");
                    errorResp.put("message", e.getMessage());
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResp);
                }
            }
            // Create a simple MultipartFile implementation
            MultipartFile mergedFile = null;
            System.out.println("Creating custom MultipartFile from merged file...");
            try {
                final Path finalFilePath = finalPath;
                final String fileName = request.getFilename();

                @SuppressWarnings("null")
                MultipartFile tempFile = new MultipartFile() {
                    @Override
                    public String getName() {
                        return fileName != null ? fileName : "";
                    }

                    @Override
                    public String getOriginalFilename() {
                        return fileName;
                    }

                    @Override
                    public String getContentType() {
                        return MediaType.APPLICATION_OCTET_STREAM_VALUE;
                    }

                    @Override
                    public boolean isEmpty() {
                        try {
                            return Files.size(finalFilePath) == 0;
                        } catch (IOException e) {
                            return true;
                        }
                    }

                    @Override
                    public long getSize() {
                        try {
                            return Files.size(finalFilePath);
                        } catch (IOException e) {
                            return 0;
                        }
                    }

                    @Override
                    public byte[] getBytes() throws IOException {
                        byte[] bytes = Files.readAllBytes(finalFilePath);
                        return bytes != null ? bytes : new byte[0];
                    }

                    @Override
                    public InputStream getInputStream() throws IOException {
                        InputStream stream = Files.newInputStream(finalFilePath);
                        if (stream == null) {
                            throw new IOException("Cannot create InputStream from file");
                        }
                        return stream;
                    }

                    @Override
                    public void transferTo(java.io.File dest) throws IOException {
                        if (dest == null) {
                            throw new IllegalArgumentException("Destination file cannot be null");
                        }
                        Files.copy(finalFilePath, dest.toPath(), StandardCopyOption.REPLACE_EXISTING);
                    }
                };
                mergedFile = tempFile;
                System.out.println("Custom MultipartFile created successfully");
            } catch (Exception e) {
                System.out.println("ERROR creating custom MultipartFile: " + e.getMessage());
                Map<String, Object> errorResp = new HashMap<>();
                errorResp.put("error", "Failed to create MultipartFile from merged chunks");
                errorResp.put("message", e.getMessage());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResp);
            }

            // Fetch Room entity by roomId using a public method (RoomResponseDto or
            // similar)

            // Call the async image upload method via a public wrapper
            System.out.println("Calling roomService.prepareAsyncImageUpload with roomId: " + request.getRoomId());
            ImageUploadMessage result = roomService.prepareAsyncImageUpload(mergedFile, request.getRoomId());
            System.out.println("RoomService result: " + result);

            // IMPORTANT: Enqueue the upload job to Redis for async processing
            System.out.println("Enqueuing upload job for async processing...");
            roomService.enqueueImageUpload(result);
            System.out.println("Upload job enqueued successfully");
            // Cleanup chunks
            try (var s = Files.list(dir)) {
                s.forEach(p -> {
                    try {
                        Files.deleteIfExists(p);
                    } catch (IOException ignored) {
                        // Log warning but continue cleanup
                    }
                });
            }
            Files.deleteIfExists(dir);

            // Save upload info to database
            // code here ...

            // return to client
            Map<String, Object> resp = new HashMap<>();
            resp.put("file", request.getFilename());
            resp.put("path", finalPath.toString());
            resp.put("size", Files.size(finalPath));
            if (request.getFileHash() != null && !request.getFileHash().trim().isEmpty()) {
                resp.put("verified", true);
                resp.put("hash", request.getFileHash());
            }

            // Delete the final file after successful upload to save disk space
            try {
                Files.deleteIfExists(finalPath);
                System.out.println("Final file deleted successfully: " + finalPath);
            } catch (IOException e) {
                System.out.println("Warning: Failed to delete final file: " + e.getMessage());
            }
            
            return ResponseEntity.ok(resp);

        } catch (Exception e) {
            System.out.println("ERROR in complete endpoint: " + e.getClass().getSimpleName() + " - " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> errorResp = new HashMap<>();
            errorResp.put("error", "Failed to complete file upload");
            errorResp.put("message", e.getMessage());
            errorResp.put("type", e.getClass().getSimpleName());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResp);
        }
    }

    /**
     * Calculate SHA-256 hash of a byte array
     */
    private String calcSha256(byte[] data) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(data);
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }

    /**
     * Calculate SHA-256 hash of a file
     */
    private String sha256OfFile(Path filePath) throws IOException {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] buffer = new byte[8192];
            int bytesRead;

            try (InputStream inputStream = Files.newInputStream(filePath)) {
                while ((bytesRead = inputStream.read(buffer)) != -1) {
                    digest.update(buffer, 0, bytesRead);
                }
            }

            byte[] hash = digest.digest();
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }

}
