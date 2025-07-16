namespace PostsManagementApi.Dtos
{
  public class UserRegisterDto
  { 
    public string FirstName { get; set; } = "";
    public string LastName { get; set; } = "";
    public string Email { get; set; } = ""; // Used as username
    public string Gender { get; set; } = "";
    public string Password { get; set; } = "";
  }
}