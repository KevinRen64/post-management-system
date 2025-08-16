using System.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MySql.Data.MySqlClient;
using PostManagement.Data;
using PostManagement.Dtos;
using PostManagement.Models;
using System.Security.Claims;

namespace UserManagement.Controllers
{
    [Authorize]
    [ApiController]
    [Route("[controller]")]
    public class PostController : ControllerBase
    {
        private readonly DataContextDapper _dapper;

        public PostController(IConfiguration config)
        {
            _dapper = new DataContextDapper(config);
        }

        // ---------------------------
        // READ
        // ---------------------------

        [HttpGet("Posts")]
        public IEnumerable<Post> GetPosts([FromQuery] bool includeDeleted = false)
        {
            // Added Status, IsDeleted, Tags to SELECT
            // Added optional filter to hide deleted posts
            string sql = @"SELECT PostId, UserId, PostTitle, PostContent, Status, IsDeleted, Tags, PostCreated, PostUpdated 
                           FROM Posts " + (includeDeleted ? "" : "WHERE IsDeleted = 0");
               

            return _dapper.LoadData<Post>(sql);
        }

        [HttpGet("PostSingle/{postId}")]
        public Post GetPostSingle(int postId, [FromQuery] bool includeDeleted = false)
        {
            // Same update: return new fields, exclude deleted by default
            string sql = @"SELECT PostId, UserId, PostTitle, PostContent, Status, IsDeleted, Tags, PostCreated, PostUpdated 
                           FROM Posts WHERE PostId = @PostId " + (includeDeleted ? "" : "AND IsDeleted = 0") + " LIMIT 1;";

            return _dapper.LoadDataSingleWithParameters<Post>(sql, new { PostId = postId });
        }

        [HttpGet("PostByUser/{userId}")]
        public IEnumerable<Post> GetPostByUser(int userId, [FromQuery] bool includeDeleted = false)
        {
            // Added Status, IsDeleted, Tags + soft delete filter
            string sql = @"SELECT PostId, UserId, PostTitle, PostContent, Status, IsDeleted, Tags, PostCreated, PostUpdated 
                           FROM Posts WHERE UserId = @UserId " + (includeDeleted ? "" : "AND IsDeleted = 0") + @"
                           ORDER BY PostCreated DESC;";

            return _dapper.LoadDataWithParameters<Post>(sql, new { UserId = userId });
        }

        [HttpGet("MyPosts")]
        public IEnumerable<Post> MyPosts([FromQuery] bool includeDeleted = false)
        {
            // Same: include new fields + deleted filter
            string sql = @"SELECT PostId, UserId, PostTitle, PostContent, Status, IsDeleted, Tags, PostCreated, PostUpdated 
                           FROM Posts 
                           WHERE UserId = @UserId " + (includeDeleted ? "" : "AND IsDeleted = 0") + @"
                           ORDER BY PostCreated DESC;";

            var userId = Convert.ToInt32(this.User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            return _dapper.LoadDataWithParameters<Post>(sql, new { UserId = userId });
        }

        [HttpGet("PostsBySearch/{searchParam}")]
        public IEnumerable<Post> PostsBySearch(string searchParam, [FromQuery] string? status = null, [FromQuery] bool includeDeleted = false)
        {
            // Post by search: filter by Status & hide deleted
            var where = new List<string> { "(PostTitle LIKE @Search OR PostContent LIKE @Search)" };
            if (!includeDeleted) where.Add("IsDeleted = 0");
            if (!string.IsNullOrWhiteSpace(status)) where.Add("Status = @Status");

            string sql = $@"SELECT PostId, UserId, PostTitle, PostContent, Status, IsDeleted, Tags, PostCreated, PostUpdated
                        FROM Posts
                        WHERE {string.Join(" AND ", where)}
                        ORDER BY PostCreated DESC;";

            return _dapper.LoadDataWithParameters<Post>(sql, new
            {
                Search = "%" + searchParam + "%",
                Status = status
            });
        }

        // ---------------------------
        // CREATE
        // ---------------------------

        [HttpPost("Post")]
        public IActionResult AddPost(PostToAddDto postToAdd)
        {
            // Added Status, IsDeleted, Tags into INSERT
            string sql = @"
            INSERT INTO Posts (
                UserId, PostTitle, PostContent, Status, IsDeleted, Tags, PostCreated, PostUpdated
            ) VALUES (
                @UserId, @PostTitle, @PostContent, @Status, 0, @Tags, NOW(), NOW()
            )";

            var userId = Convert.ToInt32(this.User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var parameters = new List<MySqlParameter>
            {
                new MySqlParameter("@UserId", MySqlDbType.Int32) { Value = userId },
                new MySqlParameter("@PostTitle", MySqlDbType.VarChar) { Value = postToAdd.PostTitle },
                new MySqlParameter("@PostContent", MySqlDbType.VarChar) { Value = postToAdd.PostContent },
                new MySqlParameter("@Status", MySqlDbType.VarChar)   { Value = postToAdd.Status ?? "Draft" },
                // Save tags as comma-separated string (or NULL if none)
                new MySqlParameter("@Tags", MySqlDbType.VarChar)     { Value = postToAdd.Tags is { Count: > 0 } ? string.Join(",", postToAdd.Tags) : (object?)DBNull.Value }
            };

            if (_dapper.ExecuteSqlWithParameters(sql, parameters))
            {
                return Ok();
            }

            throw new Exception("Failed to create new post!");
        }

        // ---------------------------
        // UPDATE
        // ---------------------------

        [HttpPut("Post")]
        public IActionResult EditPost(PostToEditedDto postToEdit)
        {
            // Added Status + Tags to UPDATE, and ignore if IsDeleted=1
            string sql = @"
            UPDATE Posts 
            SET PostTitle = @PostTitle,
                PostContent = @PostContent,
                Status = @Status,
                Tags = @Tags,
                PostUpdated = NOW()
            WHERE PostId = @PostId AND UserId = @UserId AND IsDeleted = 0";

            var userId = Convert.ToInt32(this.User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var parameters = new List<MySqlParameter>
            {
                new MySqlParameter("@PostTitle", MySqlDbType.VarChar) { Value = postToEdit.PostTitle },
                new MySqlParameter("@PostContent", MySqlDbType.VarChar) { Value = postToEdit.PostContent },
                new MySqlParameter("@Status", MySqlDbType.VarChar) { Value = postToEdit.Status ?? "Draft" },
                // Save tags as CSV
                new MySqlParameter("@Tags", MySqlDbType.VarChar) { Value = postToEdit.Tags is { Count: > 0 } ? string.Join(",", postToEdit.Tags) : (object?)DBNull.Value },
                new MySqlParameter("@PostId", MySqlDbType.Int32) { Value = postToEdit.PostId },
                new MySqlParameter("@UserId", MySqlDbType.Int32) { Value = userId }
            };

            if (_dapper.ExecuteSqlWithParameters(sql, parameters))
            {
                return Ok();
            }

            throw new Exception("Failed to edit post!");
        }

        // ---------------------------
        // SOFT DELETE + RESTORE
        // ---------------------------

        [HttpDelete("Delete/{postId}")]
        public IActionResult SoftDelete(int postId)
        {
            // Changed hard delete → soft delete (set IsDeleted=1)
            string sql = @"
            UPDATE Posts
            SET IsDeleted = 1,
            PostUpdated = NOW()
            WHERE PostId = @PostId AND UserId = @UserId AND IsDeleted = 0;";

            var userId = Convert.ToInt32(this.User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var parameters = new List<MySqlParameter>
            {
                new MySqlParameter("@PostId", MySqlDbType.Int32) { Value = postId },
                new MySqlParameter("@UserId", MySqlDbType.Int32) { Value = userId }
            };

            if (_dapper.ExecuteSqlWithParameters(sql, parameters))
            {
                return Ok();
            }

            throw new Exception("Failed to delete post!");
        }

        [HttpPost("Restore/{postId:int}")]
        public IActionResult Restore(int postId)
        {
            // New endpoint: restores a soft-deleted post (IsDeleted=0)
            string sql = @"
            UPDATE Posts
            SET IsDeleted = 0,
                PostUpdated = NOW()
            WHERE PostId = @PostId AND UserId = @UserId AND IsDeleted = 1;";

            var userId = Convert.ToInt32(this.User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var parameters = new List<MySqlParameter>
            {
                new MySqlParameter("@PostId", MySqlDbType.Int32) { Value = postId },
                new MySqlParameter("@UserId", MySqlDbType.Int32) { Value = userId }
            };

            if (_dapper.ExecuteSqlWithParameters(sql, parameters))
            {
                return Ok();
            }       
            throw new Exception("Failed to restore post!");
        }
    }
}
