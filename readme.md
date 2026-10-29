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
- [ ] 	Navigationsmenü für die Spiele implementieren
- [ ] 	Spielauswahl für Roulette und Spielautomaten gestalten
- [ ] 	Guthabenanzeige auf der Homepage integrieren
	
Joshua – Backend

- [x]   ASP.NET-Core-Projekt in C# erstellen
- [x] 	Datenbank für die Benutzer erstellen (für das Login)
- [x] 	Datenbankverbindung zum Backend einrichten
- [x] 	Endpunkte hinzufügen

Heute habe ich ein neues ASP.NET-Core Projekt und die Struktur erstellt. Zudem habe ich bereits die Klasse für die Accounts und einen Controller mit einem GET-Endpunkt erstellt und in der See-Methode zwei Testaccounts eingefügt. Danach habe ich mein Backend mit meinem SQL Server verbunden und die restlichen Endpunkte erstellt und getestet.

## 30.10.
Navid – Frontend (Login & Roulette)
- [ ] Login-Seite mit den Backend-Endpunkten verbinden
- [ ] Altersbestätigung (18+) mit JavaScript implementieren
- [ ] Grundlayout der Roulette-Spieloberfläche mit HTML und CSS erstellen
      
Amar – Frontend (Homepage & Spielautomaten)
- [ ] Homepage mit Login und Altersbestätigung verknüpfen
- [ ] Grundlayout des Spielautomaten mit HTML und CSS erstellen
- [ ] Spin-Button und zufällige Symbole mit JavaScript implementieren
      
Joshua – Backend (C# & Datenbank)
- [x] Benutzerregistrierung mit sicherer Passwortspeicherung umsetzen
- [ ] API-Endpunkte zum Abrufen und Aktualisieren des virtuellen Guthabens erstellen
- [ ] JWT beginnen zu implementieren

Ich habe das Paket BCrypt hinzugefügt. Damit werden Passwörter beim Erstellen oder Ändern eines Accounts verschlüsselt (gehasht) und nicht mehr im Klartext gespeichert. Ausserdem gibt es einen neuen Login-Endpoint, der prüft, ob das eingegebene Passwort zum gespeicherten Hash passt.



