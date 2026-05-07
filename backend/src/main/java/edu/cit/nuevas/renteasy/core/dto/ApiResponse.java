package edu.cit.nuevas.renteasy.core.dto;

import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;

public class ApiResponse<T> {
    private boolean success;
    private T data;
    private Object error;
    private String timestamp;

    public ApiResponse(boolean success, T data, Object error) {
        this.success = success;
        this.data = data;
        this.error = error;
        this.timestamp = ZonedDateTime.now(ZoneOffset.UTC).format(DateTimeFormatter.ISO_INSTANT);
    }

    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, data, null);
    }

    public static <T> ApiResponse<T> error(Object errorDetails) {
        return new ApiResponse<>(false, null, errorDetails);
    }

    public boolean isSuccess() { return success; }
    public T getData() { return data; }
    public Object getError() { return error; }
    public String getTimestamp() { return timestamp; }
}
