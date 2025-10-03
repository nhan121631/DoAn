package com.ants.ktc.ants_ktc.entities;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.Date;
import java.util.List;

@Entity
@Data
@EqualsAndHashCode(callSuper = true)
@Table(name = "contracts")
public class Contract extends BaseEntity {
    @Column(name = "contract_name", nullable = false)

    private String contractName;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private User tenant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "landlord_id", nullable = false)
    private User landlord;

    @Column(name = "start_date", nullable = false)
    private Date startDate;

    @Column(name = "end_date", nullable = false)
    private Date endDate;

    @Column(name = "deposit_amount", nullable = false)
    private Double depositAmount;

    @Column(name = "monthly_rent", nullable = false)
    private Double monthlyRent;

    @Column(name = "contract_image")
    private String contractImage;


    @Column(name = "status", nullable = false)
    private int status;
    // 0: active, 1: terminated, 2: expired, 3: pending...

    @OneToMany(mappedBy = "contract", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<Bill> bills; // Danh sách hóa đơn điện nước

    @OneToMany(mappedBy = "contract", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<TemporaryResidence> temporaryResidences; //Danh sách tạm trú
}
