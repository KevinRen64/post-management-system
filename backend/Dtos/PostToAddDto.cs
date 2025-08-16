namespace PostManagement.Dtos
{
  public class PostToAddDto
  {
    public string PostTitle { get; set; } = "";
    public string PostContent { get; set; } = "";

    //Optional: add Tags 
    public List<string>? Tags { get; set; }

    //Default to Draft when creating
    public string Status { get; set; } = "Draft";

  }
}