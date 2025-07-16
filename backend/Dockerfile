# Use official .NET SDK image to build the app
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

WORKDIR /app

# Copy csproj and restore as distinct layers
COPY *.csproj ./
RUN dotnet restore

# Copy everything else and build
COPY . ./
RUN dotnet publish -c Release -o out

# Use runtime-only image for smaller final image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime

WORKDIR /app
COPY --from=build /app/out ./

# Expose port (optional, ECS will map anyway)
EXPOSE 80
EXPOSE 443

# Run the application
ENTRYPOINT ["dotnet", "PostsManagementAPI.dll"]
