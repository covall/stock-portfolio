# Dokument wymagań produktu (PRD) - Aplikacja Stock Portfolio (MVP)

## 1. Przegląd produktu

Celem tego projektu jest stworzenie aplikacji webowej w wersji Minimum Viable Product (MVP) służącej do śledzenia wartości osobistego portfela akcji. Aplikacja przeznaczona jest dla jednego użytkownika (Piotr Kowalczyk), który jest długoterminowym inwestorem i potrzebuje prostego narzędzia do monitorowania wartości swoich inwestycji w jednym miejscu, oszczędzając czas potrzebny na sprawdzanie wielu źródeł. MVP skupia się na podstawowych funkcjach śledzenia, obliczeniach wartości i zysku/straty, wizualizacji danych oraz automatycznych podsumowaniach wysyłanych e-mailem. Aplikacja będzie responsywna i wykorzysta zewnętrzne API do pobierania danych rynkowych oraz integrację z AI do generowania podsumowań.

## 2. Problem użytkownika

Głównym problemem, który rozwiązuje aplikacja, jest brak prostego, skonsolidowanego i łatwo dostępnego narzędzia do śledzenia wartości portfela akcji posiadanego przez użytkownika. Obecnie użytkownik musi manualnie sprawdzać wartość poszczególnych akcji i portfela w różnych miejscach (np. aplikacje domów maklerskich, strony finansowe) lub prowadzić własne arkusze kalkulacyjne, co jest czasochłonne i podatne na błędy. Brakuje również automatycznych, spersonalizowanych podsumowań stanu portfela dostarczanych regularnie. Aplikacja ma na celu:

- Zapewnienie szybkiego dostępu do aktualnej wartości całego portfela i jego poszczególnych składników.
- Automatyzację obliczeń wartości portfela i zysku/straty.
- Wizualizację zmian wartości portfela i cen akcji w czasie.
- Dostarczanie regularnych podsumowań (dziennych, tygodniowych, miesięcznych) o stanie portfela drogą mailową.
- Oszczędność czasu użytkownika.

## 3. Wymagania funkcjonalne

Wymagania funkcjonalne dla MVP aplikacji Stock Portfolio:

3.1. Zarządzanie użytkownikiem:
3.1.1. Uwierzytelnianie użytkownika za pomocą Supabase Auth (rejestracja, logowanie).
3.1.2. Powiązanie danych portfela z zalogowanym użytkownikiem.

3.2. Zarządzanie portfelem:
3.2.1. Możliwość ręcznego dodawania transakcji kupna akcji (Symbol akcji, Data transakcji, Ilość, Cena, Waluta transakcji - USD/EUR/PLN).
3.2.2. Możliwość ręcznego dodawania transakcji sprzedaży akcji (Symbol akcji, Data transakcji, Ilość, Cena, Waluta transakcji - USD/EUR/PLN).
3.2.3. Wprowadzanie i edycja salda gotówkowego w portfelu w podziale na waluty (USD, EUR, PLN).

3.3. Dane rynkowe i walutowe:
3.3.1. Integracja z darmowym API (np. Alpha Vantage, FMP) w celu pobierania aktualnych cen akcji z rynku USA.
3.3.2. Integracja z publicznym API w celu pobierania kursów wymiany walut (USD, EUR, PLN) z aktualizacją co godzinę.
3.3.3. Mechanizmy obsługi błędów i niedostępności zewnętrznych API (informowanie użytkownika).

3.4. Obliczenia:
3.4.1. Obliczanie aktualnej wartości każdej pozycji akcyjnej w portfelu.
3.4.2. Obliczanie całkowitej wartości portfela (akcje + gotówka) w wybranej przez użytkownika walucie (USD/EUR/PLN) z uwzględnieniem aktualnych kursów wymiany.
3.4.3. Obliczanie zysku/straty (P/L) dla każdej pozycji akcyjnej metodą średniego kosztu zakupu (Average Cost Basis).

3.5. Interfejs użytkownika (Web):
3.5.1. Responsywny interfejs użytkownika działający na różnych urządzeniach.
3.5.2. Strona główna/Dashboard wyświetlająca:
3.5.2.1. Aktualną całkowitą wartość portfela z możliwością wyboru waluty wyświetlania (USD/EUR/PLN).
3.5.2.2. Wykres liniowy/obszarowy przedstawiający historyczną zmianę wartości portfela (interwały: 1H, 1D, 1W, 1M, 3M, 6M, YTD, 1Y, Max).
3.5.2.3. Tabelaryczną listę posiadanych akcji (symbol, ilość, aktualna cena, aktualna wartość pozycji, P/L).
3.5.2.4. Wyświetlanie aktualnego salda gotówkowego w podziale na waluty.
3.5.3. Strona szczegółów akcji wyświetlająca:
3.5.3.1. Listę historycznych transakcji użytkownika dla danej akcji.
3.5.3.2. Wykres świecowy/liniowy ceny akcji (interwały: 1H, 4H, 1D, W1, MN1).

3.6. Podsumowania AI i powiadomienia:
3.6.1. Integracja z Openrouter.ai w celu generowania podsumowań tekstowych.
3.6.2. Automatyczne generowanie dziennych, tygodniowych i miesięcznych podsumowań dotyczących zmiany wartości portfela i trendów.
3.6.3. Automatyczna wysyłka wygenerowanych podsumowań na adres e-mail użytkownika.

## 4. Granice produktu

4.1. Funkcjonalności zawarte w MVP:
_ Wszystkie funkcje wymienione w sekcji 3 (Wymagania funkcjonalne).
_ Obsługa wyłącznie akcji z rynku USA.
_ Obsługa wyłącznie walut USD, EUR, PLN.
_ Ręczne wprowadzanie danych transakcyjnych. \* Podstawowe podsumowania AI bez możliwości konfiguracji przez użytkownika.

4.2. Funkcjonalności wyłączone z MVP:
_ Import danych transakcyjnych z plików lub innych systemów (np. kont maklerskich).
_ Możliwość zlecania transakcji na rynku giełdowym.
_ Udostępnianie wyników portfela innym użytkownikom lub publicznie.
_ Funkcje społecznościowe (np. komentowanie, śledzenie innych użytkowników).
_ Obsługa innych klas aktywów (np. obligacje, kryptowaluty, fundusze ETF inne niż akcyjne).
_ Obsługa dywidend.
_ Uwzględnianie kosztów transakcyjnych (prowizji) w obliczeniach P/L.
_ Zaawansowane analizy portfela (np. alokacja sektorowa, wskaźniki ryzyka).
_ Konfiguracja treści lub częstotliwości podsumowań AI przez użytkownika.
_ Aplikacje mobilne natywne (tylko responsywna aplikacja webowa).

## 5. Historyjki użytkowników

ID: US-001
Tytuł: Rejestracja nowego użytkownika
Opis: Jako nowy użytkownik, chcę móc utworzyć konto w aplikacji, aby móc zapisywać i śledzić swój portfel akcji.
Kryteria akceptacji:
_ Given: Użytkownik nie posiada konta i znajduje się na stronie logowania/rejestracji.
_ When: Użytkownik poda wymagane dane (np. email, hasło) i kliknie przycisk "Zarejestruj się".
_ Then: System (Supabase Auth) tworzy nowe konto użytkownika.
_ And: Użytkownik zostaje automatycznie zalogowany i przekierowany do pustego dashboardu portfela. \* And: W przypadku błędu (np. zajęty email) wyświetlany jest stosowny komunikat.

ID: US-002
Tytuł: Logowanie istniejącego użytkownika
Opis: Jako zarejestrowany użytkownik, chcę móc zalogować się na swoje konto, aby uzyskać dostęp do mojego portfela akcji.
Kryteria akceptacji:
_ Given: Użytkownik posiada konto i znajduje się na stronie logowania.
_ When: Użytkownik poda poprawny email i hasło i kliknie przycisk "Zaloguj się".
_ Then: System (Supabase Auth) weryfikuje dane logowania.
_ And: Użytkownik zostaje zalogowany i przekierowany do dashboardu swojego portfela. \* And: W przypadku podania błędnych danych wyświetlany jest stosowny komunikat.

ID: US-003
Tytuł: Dodanie transakcji kupna akcji
Opis: Jako zalogowany użytkownik, chcę móc dodać nową transakcję kupna akcji do mojego portfela, aby uwzględnić ją w obliczeniach wartości i P/L.
Kryteria akceptacji:
_ Given: Użytkownik jest zalogowany i znajduje się w sekcji dodawania transakcji.
_ When: Użytkownik wprowadzi poprawne dane transakcji kupna (symbol akcji z rynku USA, data, ilość > 0, cena > 0, waluta USD/EUR/PLN) i zatwierdzi formularz.
_ Then: Transakcja zostaje zapisana w bazie danych powiązana z użytkownikiem.
_ And: Widok portfela (lista akcji, wartość całkowita, P/L) zostaje zaktualizowany. \* And: Użytkownik widzi potwierdzenie dodania transakcji.

ID: US-004
Tytuł: Dodanie transakcji sprzedaży akcji
Opis: Jako zalogowany użytkownik, chcę móc dodać nową transakcję sprzedaży akcji z mojego portfela, aby zaktualizować stan posiadania i obliczenia P/L.
Kryteria akceptacji:
_ Given: Użytkownik jest zalogowany, posiada akcje danego symbolu i znajduje się w sekcji dodawania transakcji.
_ When: Użytkownik wprowadzi poprawne dane transakcji sprzedaży (symbol posiadanej akcji, data, ilość > 0 i <= posiadanej ilości, cena > 0, waluta USD/EUR/PLN) i zatwierdzi formularz.
_ Then: Transakcja zostaje zapisana w bazie danych powiązana z użytkownikiem.
_ And: Stan posiadania danej akcji zostaje zaktualizowany.
_ And: Widok portfela (lista akcji, wartość całkowita, P/L) zostaje zaktualizowany.
_ And: Użytkownik widzi potwierdzenie dodania transakcji.

ID: US-005
Tytuł: Walidacja danych wejściowych transakcji
Opis: Jako użytkownik dodający transakcję, chcę, aby system walidował wprowadzone dane, aby zapobiec błędom.
Kryteria akceptacji:
_ Given: Użytkownik wypełnia formularz dodawania transakcji.
_ When: Użytkownik próbuje zatwierdzić formularz z niepoprawnymi danymi (np. brak symbolu, ujemna ilość/cena, data z przyszłości, sprzedaż większej ilości akcji niż posiada).
_ Then: Formularz nie zostaje zatwierdzony.
_ And: Przy błędnych polach wyświetlane są komunikaty walidacyjne wskazujące na błąd.

ID: US-006
Tytuł: Definiowanie/Edycja salda gotówkowego
Opis: Jako zalogowany użytkownik, chcę móc zdefiniować i edytować saldo posiadanej gotówki w walutach USD, EUR, PLN, aby było ono uwzględniane w całkowitej wartości portfela.
Kryteria akceptacji:
_ Given: Użytkownik jest zalogowany i znajduje się w sekcji zarządzania gotówką lub na dashboardzie.
_ When: Użytkownik wprowadzi lub zmodyfikuje kwotę gotówki dla jednej z walut (USD, EUR, PLN) i zapisze zmiany.
_ Then: Nowe saldo gotówkowe dla danej waluty zostaje zapisane w bazie danych.
_ And: Widok całkowitej wartości portfela na dashboardzie zostaje zaktualizowany. \* And: Wyświetlane saldo gotówkowe na dashboardzie jest aktualne.

ID: US-007
Tytuł: Wyświetlanie całkowitej wartości portfela
Opis: Jako zalogowany użytkownik, chcę widzieć aktualną, całkowitą wartość mojego portfela (akcje + gotówka) na dashboardzie, obliczoną na podstawie bieżących cen rynkowych i kursów walut.
Kryteria akceptacji:
_ Given: Użytkownik jest zalogowany i ma dodane transakcje lub gotówkę w portfelu.
_ When: Użytkownik otwiera dashboard portfela.
_ Then: Aplikacja pobiera aktualne ceny posiadanych akcji z API.
_ And: Aplikacja pobiera aktualne kursy wymiany walut z API.
_ And: Aplikacja oblicza wartość każdej pozycji akcyjnej i sumuje je z wartością gotówki, przeliczając wszystko na domyślną lub wybraną walutę widoku.
_ And: Na dashboardzie wyświetlana jest obliczona całkowita wartość portfela wraz z oznaczeniem waluty.

ID: US-008
Tytuł: Zmiana waluty wyświetlania wartości portfela
Opis: Jako zalogowany użytkownik, chcę móc zmienić walutę (na USD, EUR lub PLN), w której wyświetlana jest całkowita wartość mojego portfela na dashboardzie.
Kryteria akceptacji:
_ Given: Użytkownik jest zalogowany i znajduje się na dashboardzie, gdzie wyświetlana jest całkowita wartość portfela.
_ When: Użytkownik wybierze inną walutę (USD, EUR lub PLN) z dostępnego selektora waluty widoku.
_ Then: Aplikacja przelicza całkowitą wartość portfela (akcje + gotówka) na nowo wybraną walutę, używając aktualnych kursów wymiany.
_ And: Wyświetlana na dashboardzie całkowita wartość portfela jest zaktualizowana i pokazana w nowo wybranej walucie.

ID: US-009
Tytuł: Wyświetlanie wykresu wartości portfela
Opis: Jako zalogowany użytkownik, chcę widzieć na dashboardzie wykres przedstawiający historyczną zmianę wartości mojego portfela w różnych interwałach czasowych.
Kryteria akceptacji:
_ Given: Użytkownik jest zalogowany i ma historię transakcji w portfelu.
_ When: Użytkownik otwiera dashboard portfela.
_ Then: Aplikacja generuje dane historyczne wartości portfela (na podstawie transakcji i historycznych cen/kursów, lub uproszczonej historii wartości dziennych/godzinnych).
_ And: Na dashboardzie wyświetlany jest wykres (liniowy/obszarowy) pokazujący zmianę wartości portfela.
_ And: Użytkownik może wybrać interwał czasowy wykresu (1H, 1D, 1W, 1M, 3M, 6M, YTD, 1Y, Max).
_ And: Wykres aktualizuje się po zmianie wybranego interwału.

ID: US-010
Tytuł: Wyświetlanie listy posiadanych akcji z P/L
Opis: Jako zalogowany użytkownik, chcę widzieć na dashboardzie listę wszystkich aktualnie posiadanych akcji wraz z ich ilością, aktualną wartością i obliczonym zyskiem/stratą (P/L).
Kryteria akceptacji:
_ Given: Użytkownik jest zalogowany i posiada akcje w portfelu.
_ When: Użytkownik otwiera dashboard portfela.
_ Then: Aplikacja pobiera aktualne ceny posiadanych akcji.
_ And: Aplikacja oblicza P/L dla każdej pozycji metodą średniego kosztu.
_ And: Na dashboardzie wyświetlana jest tabela zawierająca: Symbol akcji, Ilość, Aktualną cenę jednostkową, Aktualną wartość pozycji, Obliczony P/L (kwotowo i procentowo).
_ And: Dane w tabeli są aktualizowane na podstawie bieżących cen rynkowych.

ID: US-011
Tytuł: Wyświetlanie szczegółów akcji (lista transakcji)
Opis: Jako zalogowany użytkownik, chcę móc przejść do strony szczegółów danej akcji z mojego portfela, aby zobaczyć historię moich transakcji dla tej konkretnej akcji.
Kryteria akceptacji:
_ Given: Użytkownik jest zalogowany i znajduje się na dashboardzie lub liście akcji.
_ When: Użytkownik kliknie na symbol lub nazwę posiadanej akcji.
_ Then: Użytkownik zostaje przekierowany na stronę szczegółów tej akcji.
_ And: Na stronie szczegółów wyświetlana jest lista wszystkich transakcji (kupna i sprzedaży) użytkownika dla tej akcji, posortowana chronologicznie (np. od najnowszej). \* And: Lista transakcji zawiera co najmniej: Datę, Typ (Kupno/Sprzedaż), Ilość, Cenę, Walutę.

ID: US-012
Tytuł: Wyświetlanie szczegółów akcji (wykres ceny)
Opis: Jako zalogowany użytkownik, chcę widzieć na stronie szczegółów akcji wykres historyczny jej ceny w różnych interwałach czasowych.
Kryteria akceptacji:
_ Given: Użytkownik znajduje się na stronie szczegółów akcji.
_ When: Strona szczegółów akcji jest ładowana.
_ Then: Aplikacja pobiera historyczne dane cenowe dla tej akcji z API.
_ And: Na stronie wyświetlany jest wykres (świecowy/liniowy) ceny akcji.
_ And: Użytkownik może wybrać interwał czasowy wykresu (1H, 4H, 1D, W1, MN1).
_ And: Wykres aktualizuje się po zmianie wybranego interwału.

ID: US-013
Tytuł: Otrzymywanie dziennego podsumowania email
Opis: Jako zalogowany użytkownik, chcę automatycznie otrzymywać codziennie e-mail z podsumowaniem zmian wartości mojego portfela z ostatniego dnia.
Kryteria akceptacji:
_ Given: Użytkownik jest zarejestrowany i ma aktywne konto.
_ When: Nadchodzi ustalony czas wysyłki dziennego podsumowania (np. po zamknięciu sesji w USA).
_ Then: System generuje podsumowanie za pomocą AI (Openrouter.ai) na podstawie danych portfela z końca dnia (zmiana wartości %, kwotowa, najlepiej/najgorzej performująca akcja dnia).
_ And: System wysyła wygenerowane podsumowanie na zarejestrowany adres e-mail użytkownika. \* And: E-mail zawiera czytelne podsumowanie tekstowe.

ID: US-014
Tytuł: Otrzymywanie tygodniowego podsumowania email
Opis: Jako zalogowany użytkownik, chcę automatycznie otrzymywać co tydzień e-mail z podsumowaniem zmian wartości mojego portfela z ostatniego tygodnia.
Kryteria akceptacji:
_ Given: Użytkownik jest zarejestrowany i ma aktywne konto.
_ When: Nadchodzi ustalony czas wysyłki tygodniowego podsumowania (np. weekend).
_ Then: System generuje podsumowanie za pomocą AI (Openrouter.ai) na podstawie danych portfela z całego tygodnia (zmiana wartości %, kwotowa, akcje o najlepszym/najsłabszym wyniku w tygodniu, ogólny trend).
_ And: System wysyła wygenerowane podsumowanie na zarejestrowany adres e-mail użytkownika. \* And: E-mail zawiera czytelne podsumowanie tekstowe.

ID: US-015
Tytuł: Otrzymywanie miesięcznego podsumowania email
Opis: Jako zalogowany użytkownik, chcę automatycznie otrzymywać co miesiąc e-mail z podsumowaniem zmian wartości mojego portfela z ostatniego miesiąca.
Kryteria akceptacji:
_ Given: Użytkownik jest zarejestrowany i ma aktywne konto.
_ When: Nadchodzi ustalony czas wysyłki miesięcznego podsumowania (np. pierwszy dzień kolejnego miesiąca).
_ Then: System generuje podsumowanie za pomocą AI (Openrouter.ai) na podstawie danych portfela z całego miesiąca (zmiana wartości %, kwotowa, najbardziej zyskowne/stratne pozycje w miesiącu, ogólny trend miesięczny).
_ And: System wysyła wygenerowane podsumowanie na zarejestrowany adres e-mail użytkownika. \* And: E-mail zawiera czytelne podsumowanie tekstowe.

ID: US-016
Tytuł: Obsługa błędu API kursów walut
Opis: Jako użytkownik, chcę być poinformowany, jeśli aplikacja nie może pobrać aktualnych kursów wymiany walut.
Kryteria akceptacji:
_ Given: API kursów wymiany walut jest niedostępne lub zwraca błąd.
_ When: Aplikacja próbuje pobrać kursy walut (np. podczas ładowania dashboardu, zmiany waluty widoku).
_ Then: Aplikacja wykorzystuje ostatnie znane, pomyślnie pobrane kursy (jeśli istnieją).
_ And: W interfejsie użytkownika (np. obok wartości portfela) wyświetlany jest wyraźny komunikat informujący o problemie z aktualizacją kursów i podający datę/godzinę ostatnich poprawnych danych.

ID: US-017
Tytuł: Obsługa błędu API cen akcji
Opis: Jako użytkownik, chcę być poinformowany, jeśli aplikacja nie może pobrać aktualnych cen dla moich akcji.
Kryteria akceptacji:
_ Given: API cen akcji jest niedostępne, przekroczono limit zapytań, lub API zwraca błąd dla konkretnego symbolu.
_ When: Aplikacja próbuje pobrać ceny akcji (np. podczas ładowania dashboardu, strony szczegółów).
_ Then: Aplikacja wykorzystuje ostatnie znane, pomyślnie pobrane ceny (jeśli istnieją).
_ And: W interfejsie użytkownika (np. obok wartości portfela lub na liście akcji) wyświetlany jest wyraźny komunikat informujący o problemie z aktualizacją cen i podający datę/godzinę ostatnich poprawnych danych lub informujący o błędzie dla konkretnego symbolu.

ID: US-018
Tytuł: Wyświetlanie pustego stanu portfela
Opis: Jako nowy użytkownik, który jeszcze nie dodał żadnych transakcji ani gotówki, chcę widzieć czytelny komunikat lub instrukcję na dashboardzie.
Kryteria akceptacji:
_ Given: Użytkownik jest zalogowany po raz pierwszy lub usunął wszystkie transakcje i gotówkę.
_ When: Użytkownik otwiera dashboard portfela.
_ Then: Zamiast wykresu i listy akcji, wyświetlany jest komunikat informujący, że portfel jest pusty.
_ And: Wyświetlany jest przycisk lub link zachęcający do dodania pierwszej transakcji lub zdefiniowania salda gotówkowego.

ID: US-019
Tytuł: Responsywność interfejsu
Opis: Jako użytkownik, chcę móc wygodnie korzystać z aplikacji na różnych urządzeniach (komputer stacjonarny, tablet, smartfon).
Kryteria akceptacji:
_ Given: Użytkownik otwiera aplikację w przeglądarce na urządzeniu o dowolnej popularnej rozdzielczości ekranu.
_ When: Użytkownik przegląda różne strony aplikacji (dashboard, szczegóły akcji, formularze).
_ Then: Układ strony dostosowuje się do rozmiaru ekranu, zapewniając czytelność i łatwość obsługi.
_ And: Wszystkie kluczowe elementy interfejsu (przyciski, pola formularzy, wykresy, tabele) są dostępne i użyteczne.

## 6. Metryki sukcesu

Ponieważ jest to MVP tworzone na potrzeby osobiste jednego użytkownika (Piotr Kowalczyk), formalne metryki sukcesu (KPI), takie jak liczba aktywnych użytkowników, wskaźnik retencji czy konwersji, nie są priorytetem i nie będą mierzone.

Głównym kryterium sukcesu MVP będzie subiektywna ocena użytkownika, czy aplikacja:

- Poprawnie i dokładnie oblicza wartość portfela oraz zysk/stratę zgodnie z wprowadzonymi transakcjami i zdefiniowanymi metodami.
- Dostarcza wymagane informacje w sposób szybki, czytelny i wygodny.
- Oszczędza czas użytkownika w porównaniu do poprzednich metod śledzenia portfela.
- Działa stabilnie i niezawodnie w zakresie zdefiniowanych funkcji.
- Poprawnie generuje i wysyła podsumowania e-mail.

Osiągnięcie tych celów będzie oznaczało sukces projektu MVP.
