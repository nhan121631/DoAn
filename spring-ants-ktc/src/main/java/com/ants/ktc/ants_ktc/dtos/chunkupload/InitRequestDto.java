package com.ants.ktc.ants_ktc.dtos.chunkupload;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class InitRequestDto {
    private String filename;
    private Integer totalChunks;
    private Long totalSize;
    private String fileHash;
}
