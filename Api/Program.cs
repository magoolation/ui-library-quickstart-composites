using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Azure.Storage.Sas;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Azure;
using Microsoft.Extensions.Options;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddAntiforgery();

builder.Services.AddAzureClients(clientBuilder =>
{
    clientBuilder.AddBlobServiceClient(builder.Configuration.GetConnectionString("Blob")!);
});

string policyName = "develop";
builder.Services.AddCors(options =>
{
    options.AddPolicy(name: policyName,
              policy =>
              {
                  policy
                  .WithOrigins("http://localhost:3000")
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .Build();
              });
});

var app = builder.Build();

app.UseAntiforgery();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors(policyName);


app.MapPost("/uploadfile", async (Stream file, [FromQuery] string filename, [FromServices] BlobServiceClient blobService) =>
{
    var containerName = "uploads";
    var containerClient = blobService.GetBlobContainerClient(containerName);

    containerClient.CreateIfNotExists();

    var blobName = filename; // Path.GetTempFileName();
    var blobClient = containerClient.GetBlobClient(blobName);

    var blob = await blobClient.UploadAsync(file, true);

    blobClient.SetHttpHeaders(new BlobHttpHeaders
    {
        //ContentType = file.ContentType,
        ContentDisposition = $"attachment; filename=\"{blobName}\""
    });

    return Results.Ok(new { url = blobClient.GenerateSasUri(BlobSasPermissions.Read, DateTime.Now.AddDays(1)) });
})
.WithName("UploadChatFile")
.WithOpenApi();

app.Run();