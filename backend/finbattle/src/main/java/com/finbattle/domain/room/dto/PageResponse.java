package com.finbattle.domain.room.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class PageResponse {

    private List<RoomResponse> roomList;
    private int page;
    private int size;
    private int totalPages;
    private long totalElements;
    private boolean last;
}
