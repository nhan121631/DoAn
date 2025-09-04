package com.ants.ktc.ants_ktc.dtos.chunkupload;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CompleteRequestDto {
    private String uploadId;
    private String filename;
    private String fileHash;
    private UUID roomId;
}