# ---------- Stufe 1: bauen ----------
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
ARG VERSION=0.0.0-local
ARG GIT_SHA=local
WORKDIR /src

# Zuerst nur die Projektdatei: so kann Docker das Laden der Pakete zwischenspeichern
COPY LP-12_API/LP-12_API.csproj LP-12_API/
RUN dotnet restore LP-12_API/LP-12_API.csproj

COPY LP-12_API/ LP-12_API/
RUN dotnet publish LP-12_API/LP-12_API.csproj -c Release -o /app --no-restore \
    -p:Version=$VERSION -p:SourceRevisionId=$GIT_SHA

# ---------- Stufe 2: ausführen ----------
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /app .
EXPOSE 8080
ENTRYPOINT ["dotnet", "LP-12_API.dll"]