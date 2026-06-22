using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Petsociety.Model;
using Petsociety.Services;
using System.Text;

// ─────────────────────────────────────────────────────────────────────────────
// STARTUP CRASH GUARD
// Wraps the entire host setup so any exception during service registration
// or builder.Build() is printed to the Output window in full detail.
//
// IMPORTANT: HostAbortedException is intentionally re-thrown WITHOUT logging.
// EF Core design-time tools (Add-Migration, Update-Database) deliberately
// throw HostAbortedException to stop the host after scanning services.
// Catching and logging it would make every migration command look like a crash.
// ─────────────────────────────────────────────────────────────────────────────
try
{
    var builder = WebApplication.CreateBuilder(args);

    // ── 1. CONTROLLERS ───────────────────────────────────────────────────────
    builder.Services.AddControllers();

    // ── 1b. APPLICATION SERVICES ─────────────────────────────────────────────
    // MessageModerationService: Singleton — stateless (static keyword arrays).
    // A singleton avoids re-allocating the keyword list on every request.
    builder.Services.AddSingleton<IMessageModerationService, MessageModerationService>();

    // AI & Image services: Scoped — use PetDbContext which is itself Scoped.
    builder.Services.AddScoped<IImageStorageService, LocalImageStorageService>();
    builder.Services.AddScoped<IAiPetMatchingService, AiPetMatchingService>();

    // ── 2. DATABASE CONTEXT ──────────────────────────────────────────────────
    builder.Services.AddDbContext<PetDbContext>(options =>
        options.UseSqlite(
            builder.Configuration.GetConnectionString("HrContext")
            ?? throw new InvalidOperationException(
                "STARTUP ERROR: Connection string 'HrContext' is missing from appsettings.json.")));

    // ── 3. CORS ──────────────────────────────────────────────────────────────
    builder.Services.AddCors(options =>
    {
        options.AddPolicy("AllowAngularClient", policy =>
        {
            policy
             .WithOrigins("http://localhost:4200")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
        });
    });

    // ── 4. JWT AUTHENTICATION ─────────────────────────────────────────────────
    // The key is read and validated here — OUTSIDE the AddJwtBearer lambda —
    // so a missing or short key throws immediately with a readable message
    // caught by the outer try-catch, not silently buried in builder.Build().
    var jwtKey = builder.Configuration["Jwt:Key"]
        ?? throw new InvalidOperationException(
               "STARTUP ERROR: 'Jwt:Key' is missing from appsettings.json. " +
               "Add a 'Jwt' section with at least a 32-character 'Key' value.");

    if (jwtKey.Length < 32)
        throw new InvalidOperationException(
            $"STARTUP ERROR: 'Jwt:Key' is too short ({jwtKey.Length} chars). " +
            "SymmetricSecurityKey requires a minimum of 32 characters (256 bits).");

    var jwtIssuer   = builder.Configuration["Jwt:Issuer"]   ?? "PetsocietyAPI";
    var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "PetsocietyClient";
    var signingKey  = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));

    builder.Services
        .AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme    = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer           = true,
                ValidateAudience         = true,
                ValidateLifetime         = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer              = jwtIssuer,
                ValidAudience            = jwtAudience,
                IssuerSigningKey         = signingKey,
                ClockSkew                = TimeSpan.Zero
            };
        });

    // ── 5. SWAGGER ────────────────────────────────────────────────────────────
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen(c =>
    {
        c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
        {
            Title       = "Pet Society API",
            Version     = "v1",
            Description = "ASP.NET Core Web API for the Pet Society platform."
        });
        c.EnableAnnotations();

        var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
        var xmlPath = System.IO.Path.Combine(AppContext.BaseDirectory, xmlFile);
        if (System.IO.File.Exists(xmlPath))
            c.IncludeXmlComments(xmlPath);
    });

    // ── BUILD ─────────────────────────────────────────────────────────────────
    var app = builder.Build();

    // ── 6. MIDDLEWARE PIPELINE (order matters) ────────────────────────────────
    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI();
    }

    app.UseStaticFiles();

    app.UseCors("AllowAngularClient");       // Must be BEFORE auth middlewares

    app.UseAuthentication();                 // Must be BEFORE UseAuthorization
    app.UseAuthorization();

    app.MapControllers();

    app.Run();
}
catch (Exception ex) when (ex is not HostAbortedException)
{
    // ── STARTUP CRASH REPORTER ────────────────────────────────────────────────
    // HostAbortedException is filtered out above so that EF design-time tools
    // (Add-Migration, Update-Database) work normally — they use that exception
    // intentionally. All other exceptions are printed here in full.
    Console.ForegroundColor = ConsoleColor.Red;
    Console.Error.WriteLine("==========================================================");
    Console.Error.WriteLine("  FATAL: Application failed to start.");
    Console.Error.WriteLine($"  Exception Type : {ex.GetType().FullName}");
    Console.Error.WriteLine($"  Message        : {ex.Message}");
    Console.Error.WriteLine($"  Inner Exception: {ex.InnerException?.Message ?? "None"}");
    Console.Error.WriteLine("----------------------------------------------------------");
    Console.Error.WriteLine("  Full Stack Trace:");
    Console.Error.WriteLine(ex.ToString());
    Console.Error.WriteLine("==========================================================");
    Console.ResetColor();
    throw;
}
// هاد الكود عشان شغلة الادمن ع سواجر لما اعمل ادد لاشي ويكون الادمن اله صلاحيه فقط عليه 
//builder.Services.AddSwaggerGen(c =>
//{
//    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
//    {
//        Name = "Authorization",
//        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
//        Scheme = "bearer",
//        BearerFormat = "JWT",
//        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
//        Description = "Enter: Bearer {your token}"
//    });

//    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
//    {
//        {
//            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
//            {
//                Reference = new Microsoft.OpenApi.Models.OpenApiReference
//                {
//                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
//                    Id = "Bearer"
//                }
//            },
//            new string[] {}
//        }
//    });
//});