FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
USER $APP_UID
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

COPY ["My_Drive/My_Drive.csproj", "My_Drive/"]
COPY ["My_Drive.Core/My_Drive.Core.csproj", "My_Drive.Core/"]
COPY ["My_Drive.Infrastructure/My_Drive.Infrastructure.csproj", "My_Drive.Infrastructure/"]
RUN dotnet restore "My_Drive/My_Drive.csproj"

COPY . .
WORKDIR "/src/My_Drive"
RUN dotnet build "My_Drive.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "My_Drive.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "My_Drive.dll"]