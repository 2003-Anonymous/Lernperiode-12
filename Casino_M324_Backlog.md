# Casino M324 Backlog und Abnahmekriterien

**Stand:** 27. Oktober 2026  
**Status:** Entwurf zur Umsetzung. Alle Aufgaben sind geplant. Dieses Dokument bestätigt keine bereits ausgeführten Implementierungen, Tests, Reviews oder Deployments.

Wir entwickeln die Casino-Anwendung mit JavaScript im Frontend und C# im Backend weiter. Für M324 steht die nachvollziehbare und automatisierte Entwicklung im Vordergrund. Wir bauen deshalb zuerst die Pipeline mit einem kleinen Health-Endpunkt auf. Danach durchlaufen Login und Guthaben denselben Ablauf. Roulette und Spielautomaten bleiben zunächst im Backlog.

## 1 Umfang und Verbindlichkeit

Das M324-Raster gewichtet A1 Anforderungsverwaltung mit 20 %, B1 lokale Entwicklungsumgebung mit 10 %, C1 Sourcecode- und Artefaktverwaltung mit 30 %, D1 automatisierte Integration mit 20 % und E1 automatisierte Auslieferung mit 20 %. Der reine Funktionsumfang der Casino-Spiele ist dort kein eigenes Bewertungskriterium.

Der bereitgestellte Projektplan beschreibt .NET 10, EF Core und SQL Server als technische Ausgangslage. Wir übernehmen das als Planungsgrundlage; der aktuelle Repository-Stand muss vor der Umsetzung geprüft werden. Konkrete Werkzeuge wie GitHub Issues, Docker, Playwright, Bicep und Azure sind Umsetzungsvorschläge des Plans, keine wörtlichen Werkzeugvorgaben des Rasters.

Für Advanced verlangt das Raster einen Werkzeugvergleich, eine selbständig eingerichtete und erweiterte Entwicklungsumgebung, Artefaktverwaltung zusammen mit Sourcecodeverwaltung, vollständige automatisierte Integration und einen umfassenden automatisierten Deploymentprozess. Dev Container, Coverage und Key Vault sind sinnvolle Soll-Erweiterungen. Ihre Verwendung allein garantiert keine bestimmte Note.

### Prioritäten und Versionen

| Priorität | Bedeutung |
|---|---|
| P0 | Grundlage für sichere Kernfunktionen und eine durchgehende, nachvollziehbare Pipeline |
| P1 | Ergänzung nach einer funktionierenden Grundlage |
| P2 | Spätere Spiel-Funktionen ohne Zusage für die M324-Abgabe |

| Vorgeschlagene Version | Geplanter Umfang |
|---|---|
| 0.1.0 | Health-Endpunkt durch CI, Release, Staging und freigegebene Produktion |
| 0.2.0 | Login, eigenes Guthaben und zugehörige Weboberfläche |
| 0.3.0 | Roulette und Spielautomaten; vorerst Backlog |

Die Versionen sind Vorschläge aus dem Projektplan. Abgabetermin, Mindestumfang und Abgabeform sind mit der Lehrperson zu klären.

### Zuständigkeiten

| Bereich | Vereinbarte Rolle oder Vorschlag |
|---|---|
| Login-Frontend | Navid, gemäss bisheriger Teamaufteilung |
| Homepage-Frontend und Guthabenanzeige | Amar, gemäss bisheriger Teamaufteilung |
| Backend und Datenbank | Joshua, gemäss bisheriger Teamaufteilung |
| DevOps und Nachweise | Vorschlag: Joshua koordiniert; Navid und Amar prüfen den lokalen Start und übernehmen gegenseitige Reviews |

## 2 Feste Anforderungs-IDs

Diese IDs bleiben stabil, auch wenn Aufgaben aufgeteilt oder Versionen verschoben werden.

| ID | Bezeichnung |
|---|---|
| F01 | Health |
| F02 | Login |
| F03 | eigenes Guthaben |
| F04 | Weboberfläche |
| F05 | Roulette |
| F06 | Slots |
| P01 | technische Anforderungsverwaltung+Traceability |
| P02 | Werkzeugvergleich für A1 Advanced |
| P03 | reproduzierbare lokale Umgebung .NET10/EF/SQLServer |
| P04 | lokale Qualitätschecks |
| P05 | Git-Workflow mit PR/Review/Schutz |
| P06 | versionierte Artefakte |
| Q01 | CI-Checks bei PR |
| Q02 | automatische Unit+Integration+E2E Tests |
| Q03 | Passwort-Hash und sichere API-Antworten/Zugriffsschutz |
| Q04 | Secrets ausserhalb Code |
| D01 | Infrastruktur als Code |
| D02 | Staging+freigegebene Produktion aus demselben Image |
| D03 | DB-Migrationen |
| D04 | Rollback inkl Schemakompatibilität |

## 3 User Stories für den Kernumfang

US01 bis US07 sind Planungskennungen dieser Datei und keine GitHub-Issue-Nummern. Echte Issue-Links werden erst nach dem Anlegen ergänzt.

### US01 Betriebsbereitschaft prüfen

**Anforderung:** F01  
**Priorität:** P0 · **Version:** Vorschlag 0.1.0 · **Zuständigkeit:** Joshua · **Status:** Geplant

Als Entwickler möchte ich die Betriebsbereitschaft der API über GET /health prüfen, damit eine fehlerhafte Version vor der weiteren Auslieferung erkannt wird.

1. **Given** API und Datenbank sind erreichbar und die benötigte Datenbankstruktur ist vorhanden. **When** GET /health aufgerufen wird. **Then** antwortet der Endpunkt mit HTTP 200 und meldet einen betriebsbereiten Zustand.
2. **Given** die Datenbank ist nicht erreichbar. **When** GET /health aufgerufen wird. **Then** meldet der Endpunkt einen Fehlerstatus ohne Zugangsdaten oder Connection String in der Antwort.

**Geplanter Nachweis:** automatisierte HTTP-Integrationstests für beide Zustände und ein Smoke-Test nach dem Deployment. Ein fehlerhafter Smoke-Test blockiert die weitere Auslieferung.

### US02 Mit einem vorhandenen Konto anmelden

**Anforderungen:** F02, Q03  
**Priorität:** P0 · **Version:** Vorschlag 0.2.0 · **Zuständigkeit:** Navid und Joshua · **Status:** Geplant

Als Spieler möchte ich mich mit Benutzername und Passwort anmelden, damit ich auf mein eigenes Konto zugreifen kann.

1. **Given** ein vorhandenes Konto mit einem korrekt gespeicherten Passwort-Hash. **When** der Spieler passende Zugangsdaten über die Login-Seite absendet. **Then** prüft das Backend das Passwort, stellt einen authentifizierten Zustand her und öffnet die Homepage; weder Passwort noch Hash werden zurückgegeben.
2. **Given** ein unbekannter Benutzername oder ein falsches Passwort. **When** die Anmeldung abgesendet wird. **Then** bleibt der Zugriff auf geschützte Kontodaten gesperrt und die Oberfläche zeigt eine allgemeine Fehlermeldung, die den falschen Teil der Zugangsdaten nicht verrät.

**Geplanter Nachweis:** Unit-Tests der Anmeldeprüfung, API-Integrationstests für Erfolg und Ablehnung sowie ein End-to-End-Test vom Formular bis zur Homepage.

**Vor Umsetzung entscheiden:** Cookie- oder Token-Verfahren für den authentifizierten Zustand. Zugriffsschutz und Tests müssen zum gewählten Verfahren passen.

### US03 Eigenes Guthaben sehen

**Anforderungen:** F03, Q03  
**Priorität:** P0 · **Version:** Vorschlag 0.2.0 · **Zuständigkeit:** Amar und Joshua · **Status:** Geplant

Als angemeldeter Spieler möchte ich mein gespeichertes Guthaben auf der Homepage sehen, damit ich weiss, wie viel Spielgeld mir zur Verfügung steht.

1. **Given** ein angemeldetes Konto besitzt ein bekanntes Guthaben. **When** der Spieler die Homepage öffnet oder neu lädt. **Then** zeigt die Oberfläche genau dieses gespeicherte Guthaben mit einer Kennzeichnung als Spielgeld an.
2. **Given** ein Spieler ist nicht angemeldet oder versucht auf ein fremdes Konto zuzugreifen. **When** die API die Guthabenanfrage erhält. **Then** gibt sie keine fremden Daten zurück und lehnt den Zugriff mit einem passenden HTTP-Status ab.

**Geplanter Nachweis:** Integrationstest mit mindestens zwei getrennten Testkonten und ein End-to-End-Test der Guthabenanzeige. Eine vom Browser übergebene Konto-ID reicht nicht als Zugriffsberechtigung.

### US04 Weboberfläche zusammen mit der API ausliefern

**Anforderung:** F04  
**Priorität:** P1 · **Version:** Vorschlag 0.2.0 · **Zuständigkeit:** Navid, Amar und Joshua · **Status:** Geplant

Als Spieler möchte ich Login und Homepage über dieselbe Anwendungsadresse erreichen, damit die Anwendung in jeder Umgebung ohne manuell angepasste API-Adressen funktioniert.

1. **Given** die Anwendung läuft lokal oder auf Staging. **When** ihre Startadresse geöffnet wird. **Then** erscheinen Login-Seite und benötigte Ressourcen ohne fehlende Dateien; API-Aufrufe verwenden relative Pfade.
2. **Given** die Oberfläche wird auf einem schmalen oder breiten Bildschirm genutzt. **When** der Spieler die Login-Felder mit der Tastatur bedient. **Then** bleiben Beschriftungen, Fokus und Formular nutzbar, ohne horizontalen Überlauf.

**Geplanter Nachweis:** Prüfung der statischen Dateien und Browser-Test. Als konkrete Layout-Prüfgrössen schlagen wir 320 und 1280 Pixel Breite vor; diese Werte sind keine Vorgaben des Rasters.

### US05 Kontodaten und Geheimnisse schützen

**Anforderungen:** Q03, Q04  
**Priorität:** P0 · **Version:** vor Freigabe von 0.2.0 · **Zuständigkeit:** Joshua, Review durch ein weiteres Teammitglied · **Status:** Geplant

Als Spieler möchte ich, dass meine Zugangsdaten geschützt bleiben und nur berechtigte Anfragen Kontodaten erhalten, damit andere Nutzer weder mein Passwort noch meine Daten auslesen können.

1. **Given** ein Testkonto wird gespeichert und über vorgesehene API-Antworten abgefragt. **When** Datenbankeintrag und Antwort geprüft werden. **Then** liegt das Passwort nur als geeigneter Passwort-Hash vor, Antworten enthalten weder Passwort noch Hash und geschützte Kontozugriffe werden kontrolliert.
2. **Given** Konfiguration und Deployment werden vorbereitet. **When** versionierte Dateien und erzeugte Logs geprüft werden. **Then** enthalten sie keine echten Passwörter, Tokens oder geheimen Verbindungsdaten; die Anwendung erhält diese Werte aus separater Secret-Verwaltung.

**Geplanter Nachweis:** Tests der Antwortobjekte und Zugriffskontrolle sowie Prüfung der Seed-Daten und Konfiguration. Falls echte Geheimnisse veröffentlicht wurden, müssen sie zuerst ersetzt oder widerrufen werden; eine Bereinigung des Git-Verlaufs allein genügt nicht.

## 4 Spiel-Stories im Backlog

Die Spielregeln und Gewinnfaktoren werden vor der Umsetzung verbindlich festgelegt. Diese Stories gehören zunächst nicht zum freigegebenen M324-Kernumfang.

### US06 Roulette mit Spielgeld spielen

**Anforderung:** F05  
**Priorität:** P2 · **Version:** Vorschlag 0.3.0 · **Zuständigkeit:** Navid und Joshua · **Status:** Backlog

Als angemeldeter Spieler möchte ich beim Roulette einen gültigen Einsatz mit Spielgeld setzen, damit ich eine Spielrunde durchführen kann.

1. **Given** der Spieler hat ausreichend Guthaben und wählt eine gültige Wette nach den festgelegten Regeln. **When** er eine Runde startet. **Then** ermittelt das Backend das Ergebnis, berechnet die Auszahlung nach den dokumentierten Regeln und speichert die Guthabenänderung genau einmal.
2. **Given** der Einsatz ist ungültig oder grösser als das verfügbare Guthaben. **When** eine Runde gestartet wird. **Then** lehnt das Backend die Runde ab und verändert das Guthaben nicht.

**Vor Umsetzung festlegen:** Roulette-Variante, Wettarten, Gewinnfaktoren und Umgang mit wiederholten Anfragen. Tests verwenden kontrollierte Ergebnisse für Gewinn und Verlust.

### US07 Einen Spielautomaten nutzen

**Anforderung:** F06  
**Priorität:** P2 · **Version:** Vorschlag 0.3.0 · **Zuständigkeit:** Amar und Joshua · **Status:** Backlog

Als angemeldeter Spieler möchte ich einen Spielautomaten mit virtuellem Einsatz drehen, damit ich eine Symbolkombination und einen möglichen Spielgeldgewinn sehen kann.

1. **Given** der Spieler hat ausreichend Guthaben für einen erlaubten Einsatz. **When** er einen Spin startet. **Then** erzeugt das Backend die Symbole, wendet die dokumentierte Gewinntabelle an und speichert Einsatz und Auszahlung genau einmal im Guthaben.
2. **Given** der Einsatz ist ungültig oder das Guthaben reicht nicht. **When** ein Spin gestartet wird. **Then** lehnt das Backend die Anfrage ab und verändert das Guthaben nicht.

**Vor Umsetzung festlegen:** Symbole, Walzen, Gewinnkombinationen, Einsatzstufen und Umgang mit wiederholten Anfragen. Die Gewinntabelle wird mit festen Beispielen getestet.

## 5 Priorisierte technische Aufgaben

Alle Aufgaben sind geplant. Die Zuständigkeiten und Nachweise sind Vorschläge zur Umsetzung.

| Reihenfolge | Aufgabe und IDs | Priorität | Vorschlag Zuständigkeit | Abnahmekriterium und geplanter Nachweis |
|---|---|---|---|---|
| 1 | Anforderungen verwalten und Werkzeuge vergleichen; P01, P02 | P0 | Team, Joshua koordiniert | Stories besitzen Abnahmekriterien und echte Issue-Links. Umsetzung und Version sind zuordenbar. Mehrere RM-Werkzeuge werden anhand gleicher Kriterien verglichen und die Auswahl wird begründet. |
| 2 | Lokale Umgebung und Qualitätschecks; P03, P04 | P0 | Joshua; Startprüfung durch Navid und Amar | Ein frischer Checkout startet nach dokumentierter Anleitung mit festgelegten Tool-Versionen und separater Konfiguration. Formatierung, Tests und Frontend-Prüfungen laufen lokal. Die selbständige Umgebungserweiterung ist begründet. |
| 3 | Git-Workflow anwenden; P05 | P0 | Team | Änderungen laufen über Issue, Branch und PR. Benötigte Checks blockieren fehlerhafte Merges. Ein tatsächliches Review mit Reaktion und ein gelöster Konflikt werden dokumentiert. Schutzfunktionen passen zu Team und Repository-Verfügbarkeit. |
| 4 | Automatisierte CI und vollständige Tests; Q01, Q02 | P0 | Joshua, Browser-Szenarien mit Navid und Amar | PRs lösen Build und Qualitätsprüfungen aus. Unit-, API-/Datenbank-Integrationstests und ein Login-/Guthaben-End-to-End-Test laufen automatisch mit getrennter Testdatenbank. Ein fehlschlagender Test blockiert nachweislich den Merge und wird danach korrigiert. |
| 5 | Versionierte Artefakte erzeugen; P06 | P0 | Joshua | Ein Versions-Tag erzeugt zuordenbare Release-Artefakte und ein Container-Image. Quellstand, Version und unveränderlicher Image-Digest sind nachvollziehbar verbunden. Ablageorte von Quelle, Build-Paket und Image sind begründet. |
| 6 | Infrastruktur und Secrets konfigurieren; D01, Q04 | P0 | Joshua, Team-Review | Eine versionierte Infrastrukturdefinition erstellt die vorgesehenen Umgebungen reproduzierbar. Geheimnisse werden separat bereitgestellt. Anbieter, Dienste, Berechtigungen und Kosten sind vor Nutzung geklärt. |
| 7 | Auslieferung und Migrationen automatisieren; D02, D03 | P0 | Joshua | Derselbe Image-Digest läuft auf Staging und nach dokumentierter Freigabe auf Produktion. Migrationen werden kontrolliert ausgeführt. Ein fehlerhafter Health-Check stoppt die weitere Auslieferung. |
| 8 | Rollback nachweisen; D04 | P0 | Joshua, nachvollziehbare Probe mit dem Team | Die vorherige geeignete Image-Version kann wieder ausgerollt werden. Ihre Kompatibilität mit dem aktuellen Datenbankschema wird geprüft. Für nicht kompatible Migrationen sind Wiederherstellung oder Vorwärtskorrektur festgelegt. Grenzen und tatsächliches Ergebnis werden protokolliert. |

### Soll-Erweiterungen nach der Grundlage

- **Dev Container zu P03:** vereinheitlicht den Einstieg und kann eine selbständige Umgebungserweiterung zeigen.
- **Coverage-Bericht zu Q02:** macht Testabdeckung sichtbar. Die Prozentzahl ersetzt weder sinnvolle Testfälle noch vollständige Integration.
- **Key Vault oder vergleichbare Secret-Verwaltung zu Q04:** kann Geheimnisse von der Anwendung trennen; die Wahl hängt von der Infrastruktur ab.

Diese Erweiterungen sind Vorschläge. Massgeblich bleiben das Raster und die tatsächlich nachgewiesenen Kompetenzen.

## 6 Definition of Ready

Eine Aufgabe kann in die Umsetzung wechseln, wenn Folgendes geklärt ist:

- [ ] Ziel und Nutzen sind verständlich beschrieben.
- [ ] Die Anforderungs-IDs sind zugeordnet.
- [ ] Abnahmekriterien sind konkret und überprüfbar.
- [ ] Abhängigkeiten und offene technische Entscheidungen sind benannt.
- [ ] Eine verantwortliche und eine prüfende Person sind vereinbart.
- [ ] Priorität und gegebenenfalls eine vorgeschlagene Version sind festgelegt.
- [ ] Benötigte Testdaten und Testumgebungen sind bekannt. Echte Zugangsdaten stehen nicht im Issue.
- [ ] Die Aufgabe ist klein genug für einen verständlichen Pull Request oder wurde aufgeteilt.

## 7 Definition of Done

Eine Aufgabe wird erst abgeschlossen, wenn die zutreffenden Punkte mit echten Belegen erfüllt sind:

- [ ] Die Änderung erfüllt ihre Abnahmekriterien.
- [ ] Das echte Issue ist mit Branch, Pull Request und Anforderungs-IDs verknüpft.
- [ ] Lokale Prüfungen und CI sind erfolgreich.
- [ ] Passende automatisierte Tests prüfen Verhalten und relevante Fehlerfälle.
- [ ] Das vereinbarte Review ist erfolgt; Rückmeldungen sind beantwortet.
- [ ] Es sind keine echten Geheimnisse enthalten und Kontodaten werden nur berechtigt ausgegeben.
- [ ] Änderungen an Datenmodell oder Konfiguration sind dokumentiert; nötige Migrationen sind versioniert.
- [ ] Anleitung, Testbeschreibung und technische Dokumentation sind bei Bedarf aktualisiert.
- [ ] Bei einer auszuliefernden Version sind Artefakte und Image zum Quellstand zuordenbar.
- [ ] Bei einer auszuliefernden Änderung sind Staging-Prüfung, Produktionsfreigabe und Rollback-Überlegungen nachgewiesen.
- [ ] Das Issue wird mit den echten Nachweisen geschlossen. Nicht zutreffende Punkte werden kurz begründet.

Für reine Analyse- oder Dokumentationsaufgaben werden Code- und Deploymentpunkte begründet als nicht zutreffend markiert. Stattdessen braucht ihr Ergebnis eine fachliche Prüfung. Ein lokales Öffnen der Login-Seite allein erfüllt diese Definition noch nicht.

## 8 Vorlage für ein GitHub Issue

Diesen Abschnitt kann das Team als Inhalt einer Issue-Vorlage übernehmen. Eckige Klammern werden beim Anlegen ersetzt. Es werden keine Beispiel-Issue-Nummern als echte Verknüpfungen verwendet.

### Titel

Als [Rolle] möchte ich [Funktion], damit [Nutzen]

### Einordnung

- **Typ:** [User Story / technische Aufgabe / Fehler]
- **Anforderungs-IDs:** [zum Beispiel F02, Q03]
- **Priorität:** [P0 / P1 / P2]
- **Status:** Geplant
- **Verantwortlich:** [tatsächlichen Assignee eintragen]
- **Review:** [vereinbarte Person eintragen]
- **Milestone:** [vereinbarte Version oder offen]

### Beschreibung

[Ausgangslage, gewünschtes Verhalten und Nutzen in wenigen Sätzen.]

### Abnahmekriterien

1. **Given** [Ausgangszustand]. **When** [Aktion]. **Then** [beobachtbares Ergebnis].
2. **Given** [Fehlerfall]. **When** [Aktion]. **Then** [beobachtbare Ablehnung oder Fehlerbehandlung].

### Umsetzung und Tests

- [ ] [Erforderlichen Umsetzungsschritt eintragen]
- [ ] [Passenden automatisierten Test ergänzen]
- [ ] [Dokumentation oder Konfiguration bei Bedarf aktualisieren]

### Abhängigkeiten und Entscheidungen

[Echte Issue-Links, Voraussetzungen und noch offene Entscheidungen. Keine Zugangsdaten einfügen.]

### Nachweise vor Abschluss

- **Pull Request:** [nach Erstellung echten Link ergänzen]
- **CI und Tests:** [nach Ausführung echten Link ergänzen]
- **Release oder Image-Digest:** [falls zutreffend]
- **Staging und Freigabe:** [falls zutreffend]
- **Definition of Done:** [erfüllt oder begründete Ausnahmen]

## 9 Nachvollziehbarkeit

Wir pflegen die Verbindung **Anforderung → Issue → Branch und Commits → Pull Request → Tests → Version und Artefakt → Auslieferung**. Erst nach tatsächlicher Erstellung oder Ausführung werden die echten Links ergänzt.

| Anforderungsbezug | Story oder Aufgabe | Echtes Issue | PR und Testnachweis | Version oder Auslieferung |
|---|---|---|---|---|
| F01 | US01 | Noch nicht angelegt | Noch nicht vorhanden | Vorschlag 0.1.0 |
| F02, Q03 | US02 | Noch nicht angelegt | Noch nicht vorhanden | Vorschlag 0.2.0 |
| F03, Q03 | US03 | Noch nicht angelegt | Noch nicht vorhanden | Vorschlag 0.2.0 |
| F04 | US04 | Noch nicht angelegt | Noch nicht vorhanden | Vorschlag 0.2.0 |
| Q03, Q04 | US05 | Noch nicht angelegt | Noch nicht vorhanden | Vor Freigabe von 0.2.0 |
| F05 | US06 | Noch nicht angelegt | Noch nicht vorhanden | Backlog, Vorschlag 0.3.0 |
| F06 | US07 | Noch nicht angelegt | Noch nicht vorhanden | Backlog, Vorschlag 0.3.0 |
| P01, P02 | Technische Aufgabe 1 | Noch nicht angelegt | Noch nicht vorhanden | Grundlage ab 0.1.0 |
| P03, P04 | Technische Aufgabe 2 | Noch nicht angelegt | Noch nicht vorhanden | Grundlage ab 0.1.0 |
| P05 | Technische Aufgabe 3 | Noch nicht angelegt | Noch nicht vorhanden | Durchgehend |
| Q01, Q02 | Technische Aufgabe 4 | Noch nicht angelegt | Noch nicht vorhanden | Grundlage ab 0.1.0 |
| P06 | Technische Aufgabe 5 | Noch nicht angelegt | Noch nicht vorhanden | Ab 0.1.0 |
| D01, Q04 | Technische Aufgabe 6 | Noch nicht angelegt | Noch nicht vorhanden | Ab 0.1.0 |
| D02, D03 | Technische Aufgabe 7 | Noch nicht angelegt | Noch nicht vorhanden | Ab 0.1.0 |
| D04 | Technische Aufgabe 8 | Noch nicht angelegt | Noch nicht vorhanden | Vor produktiver Freigabe |

Diese Tabelle ist ein Nachweisplan. Sie behauptet keine bereits vorhandenen Issues, bestandenen Tests oder abgeschlossenen Releases.

## 10 Präsentation und offene Abklärungen

Der INF-PDF-Auszug betrifft ausschliesslich Präsentation und Produktdemonstration. Er ist getrennt vom M324-Kompetenzraster zu betrachten.

Falls er für die Abgabe gilt, bereiten wir Einführung, Hauptteil und kritische Reflexion vor. Der Auszug nennt **15 bis 20 Minuten**. Medien sollen sinnvoll, visuell ansprechend und technisch vorbereitet sein. Die Live-Demo zeigt die wesentlichen Funktionen nachvollziehbar im Stand des Abgabetermins.

Vor einer verbindlichen Planung klären wir mit der Lehrperson:

- [ ] Welcher Abgabetermin und welche Abgabeform gelten?
- [ ] Wird das Team gemeinsam oder pro Person bewertet? Wie sind persönliche Beiträge nachzuweisen?
- [ ] Gibt es eine Mindestanzahl Features oder vollständig durchlaufener Stories?
- [ ] Genügt ein README oder wird eine separate Dokumentation erwartet?
- [ ] Ist eine Präsentation vorgesehen und gilt tatsächlich der Zeitrahmen von 15 bis 20 Minuten aus dem allgemeinen Auszug?
- [ ] Welche Cloud-Umgebung und welche Kosten sind freigegeben?
- [ ] Wie werden die konkreten Advanced-Nachweise beurteilt?

## 11 Quellen und Einordnung

1. **M324 Projekt – Casino-API mit CI CD.docx**, bereitgestellter Projektplan vom 27. Oktober 2026. Grundlage für Reihenfolge, technische Ausgangslage, Versionen und konkrete Werkzeugideen. Die darin beschriebenen Repository-Befunde wurden für dieses Backlog nicht unabhängig geprüft. Aussagen über bereits gesicherte Notenanteile werden nicht als Notengarantie übernommen.
2. **M324_Bewertungsraster.xlsx**, Blätter Kompetenzraster und Bewertungsraster, Zeilen 8 bis 12. Advanced steht in Kompetenzraster!F8:F12 beziehungsweise Bewertungsraster!G8:G12; Gewichtungen stehen in Bewertungsraster!D8:D12.
3. **Kriterienkatalog_INF_2026 (1).pdf**, zweiseitiger Auszug, gedruckte Seiten 52 und 53 von 56, F&P01 bis F&P04. Grundlage ausschliesslich für Präsentation und Live-Demo; Verbindlichkeit für M324 noch abklären.
4. **Teamrollen aus dem bisherigen Chat:** Navid Login-Frontend, Amar Homepage-Frontend, Joshua Backend. Die ergänzende DevOps-Zuordnung ist ein Vorschlag.

Durch die Erstellung dieser Datei wurden keine GitHub-Issues angelegt, keine Repository-Regeln verändert und keine Cloud-Ressourcen erstellt oder veröffentlicht.
