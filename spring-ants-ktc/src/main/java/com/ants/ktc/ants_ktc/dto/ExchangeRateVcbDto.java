package com.ants.ktc.ants_ktc.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class ExchangeRateVcbDto {

    private String currency;

    @JsonProperty("buy_cash")
    private Double buyCash;

    @JsonProperty("buy_transfer")
    private Double buyTransfer;

    private Double sell;

    public ExchangeRateVcbDto() {
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public Double getBuyCash() {
        return buyCash;
    }

    public void setBuyCash(Double buyCash) {
        this.buyCash = buyCash;
    }

    public Double getBuyTransfer() {
        return buyTransfer;
    }

    public void setBuyTransfer(Double buyTransfer) {
        this.buyTransfer = buyTransfer;
    }

    public Double getSell() {
        return sell;
    }

    public void setSell(Double sell) {
        this.sell = sell;
    }
}
