package com.ants.ktc.ants_ktc.services.machinelearning;

import com.ants.ktc.ants_ktc.entities.Room;

public class RoomSuggestion {
    private final Room room;
    private final double similarityScore;

    /**
     * Constructor
     * 
     * @param room            The suggested room
     * @param similarityScore The similarity score (0.0 to 1.0)
     */
    public RoomSuggestion(Room room, double similarityScore) {
        this.room = room;
        this.similarityScore = similarityScore;
    }

    public Room getRoom() {
        return room;
    }

    public double getSimilarityScore() {
        return similarityScore;
    }

    @Override
    public String toString() {
        return "RoomSuggestion{" +
                "room=" + (room != null ? room.getTitle() : "null") +
                ", similarityScore=" + String.format("%.2f", similarityScore) +
                '}';
    }
}
