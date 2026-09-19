package com.mylab.backend.inventory.infrastructure.adapters.in.rest;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.mylab.backend.inventory.application.dto.InventoryEntryHistoryItem;
import com.mylab.backend.inventory.application.dto.InventoryEntryHistoryRecord;
import com.mylab.backend.inventory.application.dto.ReverseInventoryEntryInput;
import com.mylab.backend.inventory.application.exception.InventoryEntryNotFoundException;
import com.mylab.backend.inventory.application.port.in.CreateInventoryEntryPort;
import com.mylab.backend.inventory.application.port.in.GetInventoryEntryHistoryPort;
import com.mylab.backend.inventory.application.port.in.GetInventoryEntryPort;
import com.mylab.backend.inventory.application.port.in.ReverseInventoryEntryPort;
import com.mylab.backend.inventory.domain.exception.InvalidInventoryException;
import com.mylab.backend.inventory.domain.model.InventoryEntrySource;
import com.mylab.backend.inventory.domain.model.InventoryEntryStatus;
import com.mylab.backend.inventory.domain.model.InventoryItemType;
import com.mylab.backend.inventory.domain.model.InventoryUnitOfMeasure;
import com.mylab.backend.inventory.infrastructure.adapters.in.rest.dto.ReverseInventoryEntryRequest;
import com.mylab.backend.inventory.infrastructure.adapters.in.rest.mapper.InventoryEntryRestMapper;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(InventoryEntryController.class)
@Import({InventoryExceptionHandler.class})
class InventoryEntryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CreateInventoryEntryPort createInventoryEntryPort;

    @MockitoBean
    private GetInventoryEntryHistoryPort getInventoryEntryHistoryPort;

    @MockitoBean
    private GetInventoryEntryPort getInventoryEntryPort;

    @MockitoBean
    private ReverseInventoryEntryPort reverseInventoryEntryPort;

    @MockitoBean
    private InventoryEntryRestMapper mapper;

    @Test
    @DisplayName("GET /api/v1/inventory/entries/{entryId} should return 200 with entry details")
    void shouldReturnEntryDetails() throws Exception {
        UUID entryId = UUID.randomUUID();
        UUID groupId = UUID.randomUUID();
        UUID labId = UUID.randomUUID();
        UUID itemId = UUID.randomUUID();
        UUID lineId = UUID.randomUUID();

        InventoryEntryHistoryItem item = new InventoryEntryHistoryItem(
                lineId,
                itemId,
                "Mouse sem fio Logitech",
                InventoryItemType.DURABLE,
                InventoryUnitOfMeasure.UN,
                BigDecimal.valueOf(10),
                BigDecimal.valueOf(89.99),
                null,
                null,
                null
        );

        InventoryEntryHistoryRecord record = new InventoryEntryHistoryRecord(
                entryId,
                groupId,
                labId,
                "Laboratório de Sistemas Inteligentes",
                InventoryEntrySource.PURCHASE,
                "Fornecedor Exemplo",
                LocalDate.of(2026, 9, 18),
                "Entrada de equipamentos",
                InventoryEntryStatus.CONFIRMED,
                null,
                null,
                LocalDateTime.of(2026, 9, 19, 0, 28, 58),
                List.of(item)
        );

        when(getInventoryEntryPort.get(entryId)).thenReturn(record);

        mockMvc.perform(get("/api/v1/inventory/entries/{entryId}", entryId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(entryId.toString()))
                .andExpect(jsonPath("$.researchGroupId").value(groupId.toString()))
                .andExpect(jsonPath("$.laboratoryId").value(labId.toString()))
                .andExpect(jsonPath("$.laboratoryName").value("Laboratório de Sistemas Inteligentes"))
                .andExpect(jsonPath("$.source").value("PURCHASE"))
                .andExpect(jsonPath("$.sourceName").value("Fornecedor Exemplo"))
                .andExpect(jsonPath("$.receivedAt").value("2026-09-18"))
                .andExpect(jsonPath("$.notes").value("Entrada de equipamentos"))
                .andExpect(jsonPath("$.status").value("CONFIRMED"))
                .andExpect(jsonPath("$.items[0].id").value(lineId.toString()))
                .andExpect(jsonPath("$.items[0].inventoryItemId").value(itemId.toString()))
                .andExpect(jsonPath("$.items[0].itemName").value("Mouse sem fio Logitech"))
                .andExpect(jsonPath("$.items[0].itemType").value("DURABLE"))
                .andExpect(jsonPath("$.items[0].unitOfMeasure").value("UN"))
                .andExpect(jsonPath("$.items[0].quantity").value(10))
                .andExpect(jsonPath("$.items[0].historicalUnitValue").value(89.99));
    }

    @Test
    @DisplayName("GET /api/v1/inventory/entries/{entryId} should return 404 when entry not found")
    void shouldReturn404WhenNotFound() throws Exception {
        UUID entryId = UUID.randomUUID();
        when(getInventoryEntryPort.get(entryId)).thenThrow(new InventoryEntryNotFoundException(entryId));

        mockMvc.perform(get("/api/v1/inventory/entries/{entryId}", entryId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("Inventory entry not found: " + entryId));
    }

    @Test
    @DisplayName("POST /api/v1/inventory/entries/{entryId}/reverse should return 204 when reversal succeeds")
    void shouldReturn204WhenReversalSucceeds() throws Exception {
        UUID entryId = UUID.randomUUID();
        String json = """
                {
                    "reason": "Nota fiscal registrada em duplicidade"
                }
                """;

        when(mapper.toInput(any(ReverseInventoryEntryRequest.class)))
                .thenReturn(new ReverseInventoryEntryInput("Nota fiscal registrada em duplicidade"));
        doNothing().when(reverseInventoryEntryPort).reverse(eq(entryId), any(ReverseInventoryEntryInput.class));

        mockMvc.perform(post("/api/v1/inventory/entries/{entryId}/reverse", entryId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isNoContent());

        verify(reverseInventoryEntryPort).reverse(eq(entryId), any(ReverseInventoryEntryInput.class));
    }

    @Test
    @DisplayName("POST /api/v1/inventory/entries/{entryId}/reverse should return 404 when entry not found")
    void shouldReturn404WhenReversingNonExistentEntry() throws Exception {
        UUID entryId = UUID.randomUUID();
        String json = """
                {
                    "reason": "Nota fiscal registrada em duplicidade"
                }
                """;

        when(mapper.toInput(any(ReverseInventoryEntryRequest.class)))
                .thenReturn(new ReverseInventoryEntryInput("Nota fiscal registrada em duplicidade"));
        doThrow(new InventoryEntryNotFoundException(entryId))
                .when(reverseInventoryEntryPort).reverse(eq(entryId), any(ReverseInventoryEntryInput.class));

        mockMvc.perform(post("/api/v1/inventory/entries/{entryId}/reverse", entryId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("Inventory entry not found: " + entryId));
    }

    @Test
    @DisplayName("POST /api/v1/inventory/entries/{entryId}/reverse should return 400 when reason is blank")
    void shouldReturn400WhenReasonIsBlank() throws Exception {
        UUID entryId = UUID.randomUUID();
        String json = """
                {
                    "reason": "   "
                }
                """;

        mockMvc.perform(post("/api/v1/inventory/entries/{entryId}/reverse", entryId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/v1/inventory/entries/{entryId}/reverse should return 400 when entry already reversed")
    void shouldReturn400WhenEntryAlreadyReversed() throws Exception {
        UUID entryId = UUID.randomUUID();
        String json = """
                {
                    "reason": "Estorno duplicado"
                }
                """;

        when(mapper.toInput(any(ReverseInventoryEntryRequest.class)))
                .thenReturn(new ReverseInventoryEntryInput("Estorno duplicado"));
        doThrow(new InvalidInventoryException("inventory entry is already reversed"))
                .when(reverseInventoryEntryPort).reverse(eq(entryId), any(ReverseInventoryEntryInput.class));

        mockMvc.perform(post("/api/v1/inventory/entries/{entryId}/reverse", entryId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value("inventory entry is already reversed"));
    }
}
