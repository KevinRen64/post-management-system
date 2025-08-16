namespace PostManagement.Models
{
  public class Post
  { 
    public int PostId { get; set; }
    public int UserId { get; set; }
    public string PostTitle { get; set; } = "";
    public string PostContent { get; set; } = "";
    public string? Tags { get; set; }

    // Draft | Published | Archived
    public string Status { get; set; } = "Draft";

    // Soft delete flag
    public bool IsDeleted { get; set; }
    public DateTime PostCreated { get; set; }
    public DateTime PostUpdated { get; set; }
  }
}