
// package com.ants.ktc.ants_ktc.controllers;

// import com.ants.ktc.ants_ktc.dtos.favorite.FavoriteRoomProjection;
// import com.ants.ktc.ants_ktc.services.FavoriteService;

// import java.util.UUID;

// import org.springframework.data.domain.Page;
// import org.springframework.data.domain.Pageable;
// import org.springframework.http.ResponseEntity;
// import org.springframework.security.core.Authentication;
// import org.springframework.web.bind.annotation.*;

// @RestController
// @RequestMapping("/api/favorites")
// public class FavoriteController {

//     private final FavoriteService favoriteService;

//     public FavoriteController(FavoriteService favoriteService) {
//         this.favoriteService = favoriteService;
//     }

//     @PostMapping("/rooms/{roomId}")
//     public ResponseEntity<Void> addFavoriteRoom(@PathVariable UUID roomId, Authentication authentication) {
//         String username = authentication.getName();
//         favoriteService.addFavoriteRoom(username, roomId);
//         return ResponseEntity.ok().build();
//     }

//     @DeleteMapping("/rooms/{roomId}")
//     public ResponseEntity<Void> removeFavoriteRoom(@PathVariable UUID roomId, Authentication authentication) {
//         String username = authentication.getName();
//         favoriteService.removeFavoriteRoom(username, roomId);
//         return ResponseEntity.ok().build();
//     }

//     @GetMapping
//     public ResponseEntity<Page<FavoriteRoomProjection>> getFavoriteRooms(Authentication authentication,
//             Pageable pageable) {
//         String username = authentication.getName();
//         Page<FavoriteRoomProjection> roomsPage = favoriteService.getFavoriteRooms(username, pageable);
//         return ResponseEntity.ok(roomsPage);
//     }
// }

package com.ants.ktc.ants_ktc.controllers;

import com.ants.ktc.ants_ktc.dtos.favorite.FavoriteRoomProjection;
import com.ants.ktc.ants_ktc.dtos.favorite.PageResponse;
import com.ants.ktc.ants_ktc.services.FavoriteService;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/favorites")
public class FavoriteController {

    private final FavoriteService favoriteService;

    public FavoriteController(FavoriteService favoriteService) {
        this.favoriteService = favoriteService;
    }

    @PostMapping("/rooms/{roomId}")
    public ResponseEntity<Void> addFavoriteRoom(@PathVariable("roomId") UUID roomId, Authentication authentication) {
        String username = authentication.getName();
        favoriteService.addFavoriteRoom(username, roomId);
        return ResponseEntity.ok().build();

    }

    @DeleteMapping("/rooms/{roomId}")
    public ResponseEntity<Void> removeFavoriteRoom(@PathVariable("roomId") UUID roomId, Authentication authentication) {
        String username = authentication.getName();
        favoriteService.removeFavoriteRoom(username, roomId);
        return ResponseEntity.ok().build();
    }

    @GetMapping
    public ResponseEntity<PageResponse<FavoriteRoomProjection>> getAllFavoriteRooms(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        // Gọi service để lấy danh sách phòng yêu thích với phân trang
        Page<FavoriteRoomProjection> favoriteRoomsPage = favoriteService.findAllFavoriteRooms(page, size);

        // Tạo đối tượng PageResponse từ Page của Spring
        PageResponse<FavoriteRoomProjection> response = new PageResponse<>(favoriteRoomsPage);

        return ResponseEntity.ok(response);
    }
}