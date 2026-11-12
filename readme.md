# Lernperiode 12

16.10.2026 bis 18.12.2026

## 23.10.



Navid – Frontend	
- [x] 	Login-Seite mit HTML und CSS erstellen
- [x] 	Eingabefelder für Benutzername und Passwort implementieren
- [x] 	Login-Button mit JavaScript programmieren
- [ ] 	Eingabevalidierung und Fehlermeldungen umsetzen

Heute habe ich an der Login-Seite unseres Casino-Projekts gearbeitet. Zuerst habe ich mit HTML und CSS das Grundlayout der Login Seite erstellt und gestaltet. Anschliessend habe ich zwei Eingabefelder hinzugefügt, in die der Benutzer seinen Benutzernamen und sein Passwort eingeben kann. Danach habe ich den Login-Button  programmiert, damit dieser auf einen Klick reagiert. Dabei habe ich darauf geachtet, dass die Oberfläche übersichtlich und benutzerfreundlich gestaltet ist. Ausserdem habe ich die bisherigen Funktionen getestet und kleinere Anpassungen am Design vorgenommen. 
    
Amar – Frontend
- [x] 	Grundlayout der Casino-Homepage erstellen
- [x] 	Navigationsmenü für die Spiele implementieren
- [x] 	Spielauswahl für Roulette und Spielautomaten gestalten
- [ ] 	Guthabenanzeige auf der Homepage integrieren
	
Joshua – Backend

- [x]   ASP.NET-Core-Projekt in C# erstellen
- [x] 	Datenbank für die Benutzer erstellen (für das Login)
- [x] 	Datenbankverbindung zum Backend einrichten
- [x] 	Endpunkte hinzufügen

Heute habe ich ein neues ASP.NET-Core Projekt und die Struktur erstellt. Zudem habe ich bereits die Klasse für die Accounts und einen Controller mit einem GET-Endpunkt erstellt und in der See-Methode zwei Testaccounts eingefügt. Danach habe ich mein Backend mit meinem SQL Server verbunden und die restlichen Endpunkte erstellt und getestet.

## 30.10.
Navid – Frontend (Login & Roulette)
- [x] Buttons Roulette
- [x] Altersbestätigung (18+) mit JavaScript implementieren
- [x] Grundlayout der Roulette-Spieloberfläche mit HTML und CSS erstellen
      
Amar – Frontend (Homepage & Spielautomaten)
- [ ] Homepage mit Login und Altersbestätigung verknüpfen
- [ ] Grundlayout des Spielautomaten mit HTML und CSS erstellen
- [ ] Spin-Button und zufällige Symbole mit JavaScript implementieren
      
Joshua – Backend (C# & Datenbank)
- [x] Benutzerregistrierung mit sicherer Passwortspeicherung umsetzen
- [x] Cookies implementieren
- [x] Login, Logout, Register-Endpunkte hinzufügen und die anderen anpassen.

Ich habe das Paket BCrypt hinzugefügt. Damit werden Passwörter beim Erstellen oder Ändern eines Accounts verschlüsselt (gehasht) und nicht mehr im Klartext gespeichert. Ausserdem gibt es einen neuen Login-Endpoint, der prüft, ob das eingegebene Passwort zum gespeicherten Hash passt. Zudem habe ich Login, Logout und Register-Endpunkte hinzugefügt und diese mit einem Cookie verknüpft. Wenn sich ein Spieler also anmeldet, wird ein Cookie erstellt und gilt bei der API als angemeldet. So hat er Zugriff auf andere Endpunkte, wie z.B. Logout oder er kann seinen eigenen Account mit /me ansehen. Das Passwort wird aber nie in der Response mitgegeben. Ist der angemeldete Spieler Admin, hat er noch Zugriff auf GetAllAccounts, GetAccount und DeleteAccount.

## 06.11.26

Navid
- [x] Registrierungsseite erstellen: Eine Seite mit Eingabefeldern für die benötigten Benutzerdaten gestalten.
- [x] Benutzerdaten speichern: Die bei der Registrierung eingegebenen Daten speichern, damit sie für die Anmeldung    verwendet werden können.
- [x] Anmeldung umsetzen: Nutzerinnen und Nutzer können sich mit ihren gespeicherten Zugangsdaten anmelden.


Ich habe an der Registrierung und am Login gearbeitet. Dazu gehören die Registrierungsseite mit Eingabeprüfung, das Speichern der Anmeldedaten und die Anmeldung mit einem bestehenden Konto. Beim Hochladen meiner Änderungen ist es jedoch noch nicht vollständig gelungen, den richtigen Branch beziehungsweise Pull Request zu aktualisieren. Ausserdem sind noch Prüfungen in der CI fehlgeschlagen. Deshalb sind die Arbeitspakete noch nicht abschliessend abgeschlossen. Als Nächstes müssen der Upload korrigiert, die Fehler behoben und die erfolgreichen Checks überprüft werden.

Amar
- [x] Neue Bilder für Slot Maschiene
- [x] Slot Maschiene Programmieren
- [ ] Neues Design
      
Joshua
- [x] Absprechen mit Amar und Navid, wer die Spiellogik übernimmt (Backend / Frontend)
- [ ] Evtl. Endpunkte für die Games hinzufügen.
- [ ] 3. Game ausdenken und planen.

Die Endpunkte werden doch nicht benötigt, da die Gamelogik beim Frontend bleibt. Die API ist also soweit fertig. Dazu habe ich noch ein neues Issue für das Registrieren erstellt, da man sich bis jetzt nur anmelden kann. Dieses habe ich dem Milestone 0.3.0 (MVP) zugeordnet.


## 13.11.26

Navid
- [ ] Fehler beheben Pull request
- [ ] Login in Registrierung miteinander verbinden 
- [ ] Test durchführen

Joshua
- [ ] Layout für Game planen
- [ ] 3 Lose mit verschiedenen Themen und Feldern entwerfen
- [ ] Grundgerüst für das Game programmieren, Klassen und Funktionen erstellen
## Schnellstart

Voraussetzungen: Docker Desktop, .NET 10 SDK, Python

1. `git clone https://github.com/2003-Anonymous/Lernperiode-12.git`
2. `.env.example` nach `.env` kopieren und ein Passwort eintragen
3. `docker compose up -d`
4. `dotnet tool restore`
5. `dotnet user-secrets set "ConnectionStrings:CasinoContext" "Server=localhost,1434;Database=Casino;User Id=sa;Password=<Passwort aus .env>;TrustServerCertificate=True" --project LP-12_API`
6. `dotnet tool run dotnet-ef database update --project LP-12_API`
7. `pip install pre-commit` und `pre-commit install`
8. `dotnet run --project LP-12_API`, dann http://localhost:5241/health

Alternativ: in VS Code «Reopen in Container» (Dev Container).
