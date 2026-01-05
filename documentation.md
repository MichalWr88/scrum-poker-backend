# Dokumentacja Zdarzeń WebSocket

Poniżej znajduje się diagram i opis zdarzeń WebSocket używanych w aplikacji.

## Diagram Przepływu Zdarzeń (Mermaid)

```mermaid
graph TD
    subgraph "Użytkownik (Klient)"
        A[Klient]
    end

    subgraph "Serwer (Socket.io)"
        B(Odbiera zdarzenie)
        C{Logika biznesowa}
        D(Wysyła zdarzenie)
    end

    subgraph "Adresaci"
        E[Wszyscy w pokoju]
        F[Wszyscy w pokoju oprócz nadawcy]
        G[Tylko nadawca]
    end

    A -- Zdarzenia przychodzące --> B
    B --> C
    C --> D

    D -- io.to(roomId).emit --> E
    D -- socket.broadcast.to(roomId).emit --> F
    D -- socket.emit --> G


    %% Definicje zdarzeń
    subgraph "Zdarzenia Przychodzące (Klient -> Serwer)"
        Join[JOIN_ROOM]
        Leave[LEAVE_ROOM]
        Vote[SEND_VOTE]
        ClearAll[CLEAR_ALL_VOTES]
        ClearMy[CLEAR_MY_VOTE]
        Toggle[TOGGLE_VOTES]
        FetchTask[FETCHED_NEW_TASK]
        PendingTask[PENDING_NEW_TASK]
    end

    subgraph "Zdarzenia Wychodzące (Serwer -> Klient)"
        UsersUpdated[ROOM_USERS_UPDATED]
        VotesUpdated[VOTES_UPDATED]
        VotesCleared[VOTES_CLEARED]
        ToggleVotes[TOGGLE_VOTES]
        IsPending[IS_PENDING_NEW_TASK]
        FetchedTask[FETCHED_NEW_TASK]
    end

    %% Mapowanie przepływu
    Join --> C --> UsersUpdated
    UsersUpdated -- Do wszystkich w pokoju --> E

    Leave --> C --> UsersUpdated
    
    Vote --> C --> VotesUpdated
    VotesUpdated -- Do wszystkich w pokoju --> E

    ClearAll --> C --> VotesUpdated
    ClearAll --> C --> VotesCleared
    VotesCleared -- Do wszystkich w pokoju --> E

    ClearMy --> C --> VotesUpdated

    Toggle --> C --> ToggleVotes
    ToggleVotes -- Do wszystkich w pokoju --> E

    PendingTask --> C --> IsPending
    IsPending -- Do wszystkich oprócz nadawcy --> F

    FetchTask --> C --> FetchedTask
    FetchedTask -- Do wszystkich oprócz nadawcy --> F
```

## Opis Zdarzeń i Payloadów

### Zdarzenia Przychodzące (Klient -> Serwer)

| Nazwa Zdarzenia | Payload | Opis |
| :--- | :--- | :--- |
| `JOIN_ROOM` | `{ roomId: string, user: User }` | Dołącza użytkownika do pokoju. |
| `LEAVE_ROOM` | `{ roomId: string }` | Usuwa użytkownika z pokoju. |
| `SEND_VOTE` | `{ roomId: string, vote: string \| number }` | Wysyła głos użytkownika. |
| `CLEAR_ALL_VOTES` | `{ roomId: string }` | Żądanie wyczyszczenia wszystkich głosów w pokoju. |
| `CLEAR_MY_VOTE` | `{ roomId: string }` | Żądanie wyczyszczenia głosu bieżącego użytkownika. |
| `TOGGLE_VOTES` | `{ roomId: string, show: boolean }` | Żądanie pokazania lub ukrycia wyników głosowania. |
| `PENDING_NEW_TASK` | `{ roomId: string }` | Informuje, że nowy task jest w trakcie przygotowania. |
| `FETCHED_NEW_TASK` | `{ roomId: string, task: object }` | Wysyła nowo pobrany task do innych. |

### Zdarzenia Wychodzące (Serwer -> Klient)

| Nazwa Zdarzenia | Payload | Propagacja | Opis |
| :--- | :--- | :--- | :--- |
| `ROOM_USERS_UPDATED` | `Vote[]` | **Do wszystkich w pokoju** | Wysyła zaktualizowaną listę użytkowników i ich głosów. |
| `VOTES_UPDATED` | `Vote[]` | **Do wszystkich w pokoju** | Wysyła zaktualizowaną listę głosów po tym, jak ktoś zagłosował. |
| `VOTES_CLEARED` | `void` | **Do wszystkich w pokoju** | Informuje, że wszystkie głosy zostały wyczyszczone. |
| `TOGGLE_VOTES` | `{ show: boolean }` | **Do wszystkich w pokoju** | Wysyła stan widoczności wyników głosowania. |
| `IS_PENDING_NEW_TASK` | `void` | **Do wszystkich oprócz nadawcy** | Informuje innych użytkowników, że nowy task jest w przygotowaniu. |
| `FETCHED_NEW_TASK` | `object` | **Do wszystkich oprócz nadawcy** | Rozsyła nowo pobrany task do pozostałych użytkowników w pokoju. |

### Typy Danych

*   **`User`**: `{ dbId: string, role: string, name: string, email: string }`
*   **`Vote`**: `{ userId: string, user: User, value: string | number | null }`
