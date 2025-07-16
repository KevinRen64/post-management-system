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

        [HttpGet("Posts")]
        public IEnumerable<Post> GetPosts()
        {
            string sql = @"SELECT PostId, UserId, PostTitle, PostContent, PostCreated, PostUpdated 
                           FROM Posts";

            return _dapper.LoadData<Post>(sql);
        }

        [HttpGet("PostSingle/{postId}")]
        public Post GetPostSingle(int postId)
        {
            string sql = @"SELECT PostId, UserId, PostTitle, PostContent, PostCreated, PostUpdated 
                           FROM Posts WHERE PostId = @PostId";

            return _dapper.LoadDataSingleWithParameters<Post>(sql, new { PostId = postId });
        }

        [HttpGet("PostByUser/{userId}")]
        public IEnumerable<Post> GetPostByUser(int userId)
        {
            string sql = @"SELECT PostId, UserId, PostTitle, PostContent, PostCreated, PostUpdated 
                           FROM Posts WHERE UserId = @UserId";

            return _dapper.LoadDataWithParameters<Post>(sql, new { UserId = userId });
        }

        [HttpGet("MyPosts")]
        public IEnumerable<Post> MyPosts()
        {
            string sql = @"SELECT PostId, UserId, PostTitle, PostContent, PostCreated, PostUpdated 
                           FROM Posts WHERE UserId = @UserId";

            var userId = Convert.ToInt32(this.User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            return _dapper.LoadDataWithParameters<Post>(sql, new { UserId = userId });
        }

        [HttpPost("Post")]
        public IActionResult AddPost(PostToAddDto postToAdd)
        {
            string sql = @"
            INSERT INTO Posts (
                UserId, PostTitle, PostContent, PostCreated, PostUpdated
            ) VALUES (
                @UserId, @PostTitle, @PostContent, NOW(), NOW()
            )";

            var userId = Convert.ToInt32(this.User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var parameters = new List<MySqlParameter>
            {
                new MySqlParameter("@UserId", MySqlDbType.Int32) { Value = userId },
                new MySqlParameter("@PostTitle", MySqlDbType.VarChar) { Value = postToAdd.PostTitle },
                new MySqlParameter("@PostContent", MySqlDbType.VarChar) { Value = postToAdd.PostContent }
            };

            if (_dapper.ExecuteSqlWithParameters(sql, parameters))
            {
                return Ok();
            }

            throw new Exception("Failed to create new post!");
        }

        [HttpPut("Post")]
        public IActionResult EditPost(PostToEditedDto postToEdit)
        {
            string sql = @"
            UPDATE Posts 
            SET PostTitle = @PostTitle,
                PostContent = @PostContent,
                PostUpdated = NOW()
            WHERE PostId = @PostId AND UserId = @UserId";

            var userId = Convert.ToInt32(this.User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            var parameters = new List<MySqlParameter>
            {
                new MySqlParameter("@PostTitle", MySqlDbType.VarChar) { Value = postToEdit.PostTitle },
                new MySqlParameter("@PostContent", MySqlDbType.VarChar) { Value = postToEdit.PostContent },
                new MySqlParameter("@PostId", MySqlDbType.Int32) { Value = postToEdit.PostId },
                new MySqlParameter("@UserId", MySqlDbType.Int32) { Value = userId }
            };

            if (_dapper.ExecuteSqlWithParameters(sql, parameters))
            {
                return Ok();
            }

            throw new Exception("Failed to edit post!");
        }

        [HttpDelete("Delete/{postId}")]
        public IActionResult RemoveUser(int postId)
        {
            string sql = @"DELETE FROM Posts WHERE PostId = @PostId AND UserId = @UserId";

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

        [HttpGet("PostsBySearch/{searchParam}")]
        public IEnumerable<Post> PostsBySearch(string searchParam)
        {
            string sql = @"SELECT PostId, UserId, PostTitle, PostContent, PostCreated, PostUpdated 
                           FROM Posts 
                           WHERE PostTitle LIKE @Search OR PostContent LIKE @Search";

            return _dapper.LoadDataWithParameters<Post>(sql, new { Search = "%" + searchParam + "%" });
        }
    }
}
