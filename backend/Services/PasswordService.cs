using System.Security.Cryptography;
using System.Text;

namespace PostsManagementApi.Services
{
  public class PasswordService
  {
    public void CreatePasswordHash(string password, out string hash, out string salt)
    {
        using var hmac = new HMACSHA512();
        salt = Convert.ToBase64String(hmac.Key);
        hash = Convert.ToBase64String(hmac.ComputeHash(Encoding.UTF8.GetBytes(password)));
    }

    public bool VerifyPassword(string password, string storedHash, string storedSalt)
    {
        var hmac = new HMACSHA512(Convert.FromBase64String(storedSalt));
        var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
        return Convert.ToBase64String(computedHash) == storedHash;
    }

  }
}