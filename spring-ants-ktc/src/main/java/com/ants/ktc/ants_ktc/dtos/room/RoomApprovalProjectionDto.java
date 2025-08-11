package com.ants.ktc.ants_ktc.dtos.room;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoomApprovalProjectionDto {

    private int approval;
    private String message;

    public void setApproval(int approval) {
        if (approval != 0 && approval != 1 && approval != 2) {
            throw new IllegalArgumentException("Approval must be 0, 1, or 2");
        }
        this.approval = approval;
    }

    public int getApproval() {
        return approval;
    }
}
