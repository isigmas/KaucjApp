package pl.isigmas.kaucjapp.repository;

import pl.isigmas.kaucjapp.DTO.OfferDTO;

public class OfferRepo {

    /*
     * Create new offer and return its id
     * 
     * @params:
     * 
     */
    public Long create() {

        Long newId = Long.valueOf(1);

        return newId;
    }

    /*
     * Update offer return true if update was successful, false otherwise
     * 
     * @params:
     * 
     */
    public boolean update() {

        boolean isUpdated = true;

        return isUpdated;
    }

    /*
     * Remove offer and return true if remove was successful, false otherwise
     * 
     * @params:
     * 
     */
    public boolean remove() {

        boolean isRemoved = true;

        return isRemoved;
    }
}
