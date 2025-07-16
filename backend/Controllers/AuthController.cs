using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using PostsManagementApi.Dtos;
using PostsManagementApi.Services;
using PostManagement.Data;
using PostManagement.Models;

namespace PostsManagementApi.Controllers
{
  // All routes require authorization unless marked with [AllowAnonymous]
  [ApiController]
  [Authorize]
  [Route("[controller]")]
  public class AuthController : ControllerBase
  {
    private readonly DataContextDapper _dapper;
    private readonly IConfiguration _config;
    private readonly PasswordService _passwordService;

    // Constructor injects configuration and initializes Dapper + password helper
    public AuthController(IConfiguration config)
    {
      _config = config;
      _dapper = new DataContextDapper(config);
      _passwordService = new PasswordService();
    }

    // ===============================
    // POST /auth/register
    // Registers a new user (public)
    // ===============================
    [AllowAnonymous]
    [HttpPost("Register")]
    public IActionResult Register(UserRegisterDto userDto)
    {
      // 1. Check if the email already exists in the database
      string checkSql = "SELECT COUNT(*) FROM Users WHERE Email = @Email;";
      int existingUser = _dapper.LoadDataSingleWithParameters<int>(checkSql, new { userDto.Email });

      if (existingUser > 0)
      {
        // Return a 400 BadRequest if the email is already taken
        return BadRequest("Email is already registered.");
      }

      // 2. Securely hash the password and generate a salt
      _passwordService.CreatePasswordHash(userDto.Password, out string hash, out string salt);

      // 3. Prepare the SQL query to insert the new user
      string sql = @"INSERT INTO Users (FirstName, LastName, Email, Gender, Active, PasswordHash, PasswordSalt)
                           VALUES (@FirstName, @LastName, @Email, @Gender, @Active, @PasswordHash, @PasswordSalt);";

      // 4. Map parameters for the SQL query using the DTO + hashed password
      var parameters = new
      {
        userDto.FirstName,
        userDto.LastName,
        userDto.Email,
        userDto.Gender,
        Active = true,
        PasswordHash = hash,
        PasswordSalt = salt
      };

      // 5. Execute the insert operation and check result
      int rows = _dapper.ExecuteSqlWithSingleParameter(sql, parameters);

      if (rows > 0)
      {
        // 6. Return success response with the user's email
        return Ok(new { message = "User registered successfully", email = userDto.Email });
      }

      // 7. If insert failed, return a 500 Internal Server Error
      return StatusCode(500, new { message = "User registration failed." });
    }

    // =============================
    // POST /auth/login
    // Authenticates a user (public)
    // =============================   
    [AllowAnonymous]
    [HttpPost("Login")]
    public IActionResult Login(UserLoginDto loginDto)
    {
      // 1. Query the user by email
      string sql = "SELECT * FROM Users WHERE Email = @Email;";
      var user = _dapper.LoadDataSingleWithParameters<User>(sql, new { loginDto.Email });

      // 2. If user not found, return Unauthorized
      if (user == null)
        return Unauthorized("User not found.");

      // 3. Verify password using stored hash and salt
      bool isPasswordValid = _passwordService.VerifyPassword(loginDto.Password, user.PasswordHash, user.PasswordSalt);

      // 4. If invalid, return Unauthorized
      if (!isPasswordValid)
        return Unauthorized("Invalid password.");

      // 5. Generate JWT token on successful login
      string token = CreateJwtToken(user);

      // 6. Return token to frontend
      return Ok(new { token });
    }
    
    // Helper method to create a signed JWT token
    private string CreateJwtToken(User user)
    {
      // 1. Define claims to include in the JWT
      var claims = new[]
      {
          new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
          new Claim(ClaimTypes.Email, user.Email),
          new Claim(ClaimTypes.Name, $"{user.FirstName} {user.LastName}")
      };

      // 2. Generate security key from configuration
      var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["JwtSettings:Key"]!));

      // 3. Create signing credentials using HMAC SHA-512
      var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);

      // 4. Build the JWT token with claims, expiration, and credentials
      var token = new JwtSecurityToken(
          issuer: _config["JwtSettings:Issuer"],
          audience: _config["JwtSettings:Audience"],
          claims: claims,
          expires: DateTime.Now.AddHours(1),
          signingCredentials: creds
      );

      // 5. Return the JWT token as a string
      return new JwtSecurityTokenHandler().WriteToken(token);
    }

  }

}

