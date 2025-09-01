package com.ants.ktc.ants_ktc.dtos.approval;

public class ApprovalRequestDto {
    private String id;
    private String title;
    private String description;
    private Long priceMonth;
    private Long priceDeposit;
    private Double area;
    private Double length;
    private Double width;
    private Integer maxPeople;
    private Long elecPrice;
    private Long waterPrice;
    private String fullAddress;
    private java.util.List<String> convenients;
    private java.util.List<String> images;

    // Getters and setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Long getPriceMonth() {
        return priceMonth;
    }

    public void setPriceMonth(Long priceMonth) {
        this.priceMonth = priceMonth;
    }

    public Long getPriceDeposit() {
        return priceDeposit;
    }

    public void setPriceDeposit(Long priceDeposit) {
        this.priceDeposit = priceDeposit;
    }

    public Double getArea() {
        return area;
    }

    public void setArea(Double area) {
        this.area = area;
    }

    public Double getLength() {
        return length;
    }

    public void setLength(Double length) {
        this.length = length;
    }

    public Double getWidth() {
        return width;
    }

    public void setWidth(Double width) {
        this.width = width;
    }

    public Integer getMaxPeople() {
        return maxPeople;
    }

    public void setMaxPeople(Integer maxPeople) {
        this.maxPeople = maxPeople;
    }

    public Long getElecPrice() {
        return elecPrice;
    }

    public void setElecPrice(Long elecPrice) {
        this.elecPrice = elecPrice;
    }

    public Long getWaterPrice() {
        return waterPrice;
    }

    public void setWaterPrice(Long waterPrice) {
        this.waterPrice = waterPrice;
    }

    public String getFullAddress() {
        return fullAddress;
    }

    public void setFullAddress(String fullAddress) {
        this.fullAddress = fullAddress;
    }

    public java.util.List<String> getConvenients() {
        return convenients;
    }

    public void setConvenients(java.util.List<String> convenients) {
        this.convenients = convenients;
    }

    public java.util.List<String> getImages() {
        return images;
    }

    public void setImages(java.util.List<String> images) {
        this.images = images;
    }
}
