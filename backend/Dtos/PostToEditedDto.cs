namespace PostManagement.Dtos
{
  public class PostToEditedDto
  {
    public int PostId { get; set; }
    public string PostTitle { get; set; } = "";
    public string PostContent { get; set; } = "";
    
    public List<string>? Tags { get; set; }
    public string Status { get; set; } = "Draft";
  }
}