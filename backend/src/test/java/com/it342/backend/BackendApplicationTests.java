package com.it342.backend;

import org.junit.jupiter.api.Test;

import edu.cit.nuevas.renteasy.BackendApplication;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

class BackendApplicationTests {

    @Test
    void applicationEntryPointCanBeLoaded() {
        assertDoesNotThrow(() -> new BackendApplication());
    }
}
