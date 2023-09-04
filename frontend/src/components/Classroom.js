import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { BeatLoader } from "react-spinners";

const Classroom = () => {
  const { classroomId } = useParams();
  const [posts, setPosts] = useState([]);
  const [students, setStudents] = useState();
  const [classrooms, setClassrooms] = useState([]);
  const [isCommentSubmittingMap, setIsCommentSubmittingMap] = useState({});
  const [inviteEmail, setInviteEmail] = useState(""); // State to store the invitee's email
  const [isInvitePopupOpen, setIsInvitePopupOpen] = useState(false); // State to control the popup visibility

  const handleCreatePost = async (e) => {
    e.preventDefault();
    const postHeading = e.target.postHeading.value;
    const postContent = e.target.postContent.value;
    const attachmentUrl = e.target.attachmentUrl.value;

    const postData = {
      heading: postHeading,
      content: postContent,
      attachmentUrl: attachmentUrl,
    };

    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await axios.post(
        `http://localhost:8000/api/classrooms/${classroomId}/posts`,
        postData,
        {
          headers: {
            "auth-token": accessToken,
          },
        }
      );

      const createdPost = response.data.post;
      setPosts([...posts, createdPost]);
    } catch (error) {
      console.error("Error creating post:", error);
    }

    e.target.reset();
  };

  //Fetch classroom data from the backend (assuming your API endpoint is /api/classrooms/:classroomId)
  useEffect(() => {
    const fetchClassrooms = async () => {
      const accessToken = localStorage.getItem("accessToken");
      try {
        const response = await axios.get(
          `http://localhost:8000/api/classrooms/${classroomId}/posts`,
          {
            headers: {
              "auth-token": accessToken,
            },
          }
        );
        setPosts(response.data.data.posts);
      } catch (error) {
        console.error("Error fetching classrooms:", error);
      }
    };
    fetchClassrooms();
  }, []);

  useEffect(() => {
    console.log("classroomId:", classroomId); // Check the classroom ID in the console
    const fetchClassroomData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/api/classrooms/${classroomId}`
        );
        const classroomData = response.data.data;
        setClassrooms(classroomData);
      } catch (error) {
        console.error("Error fetching classroom data:", error);
      }
    };

    fetchClassroomData();
  }, [classroomId]);

  const handleCreateComment = async (postId, e) => {
    e.preventDefault();
    const commentContent = e.target.commentContent.value;

    const commentData = {
      content: commentContent,
    };

    // Set loading status for the specific post
    setIsCommentSubmittingMap((prevState) => ({
      ...prevState,
      [postId]: true,
    }));

    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await axios.post(
        `http://localhost:8000/api/classrooms/${postId}/comment`,
        commentData,
        {
          headers: {
            "auth-token": accessToken,
          },
        }
      );

      const createdComment = response.data.comment;

      // Update the posts state to include the new comment
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post._id === postId) {
            return {
              ...post,
              comments: [...post.comments, createdComment],
            };
          }
          return post;
        })
      );

      e.target.reset();
    } catch (error) {
      console.error("Error creating comment:", error);
    } finally {
      // Reset loading status for the specific post
      setIsCommentSubmittingMap((prevState) => ({
        ...prevState,
        [postId]: false,
      }));
    }
  };

  const handleInviteClick = () => {
    setIsInvitePopupOpen(true); // Open the invite popup
  };

  const handleInviteSubmit = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await axios.post(
        "http://localhost:8000/api/auth/send-email",
        {
          userEmail: inviteEmail, // Use the email from the state
          classroomId: classroomId, // Use the classroomId from the state
        },
        {
          headers: {
            "Content-Type": "application/json",
            "auth-token": accessToken,
          },
        }
      );

      // Handle the response as needed
      console.log("Invite email sent:", response.data);

      setInviteEmail("");
      
      // Close the invite popup
      setIsInvitePopupOpen(false);
    } catch (error) {
      console.error("Error sending invite email:", error);
    }
  };

  return (
    <div className="container mx-auto py-8">
      {/* <h2 className="text-2xl font-bold mb-4">Classroom {classroomId}</h2> */}
      <h2 className="text-2xl font-bold mb-4">
        {classrooms.subject} - {classrooms.standard}
      </h2>

      <div className="flex justify-between mb-4">
        <h3 className="text-xl font-semibold">Create New Post</h3>
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
          onClick={handleInviteClick} // Open the invite popup when clicked
        >
          Add Mentee
        </button>
      </div>

      <div className="bg-white rounded shadow p-4 mb-6">
        <form onSubmit={handleCreatePost}>
          <input
            type="text"
            name="postHeading"
            className="w-full rounded border-gray-300 mb-2"
            placeholder="Post Heading"
            required
          />
          <textarea
            name="postContent"
            rows="3"
            className="w-full rounded border-gray-300 mb-2"
            placeholder="Write your post..."
            required
          ></textarea>
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Attachments:
            </label>
            <div className="mt-1">
              <label htmlFor="attachmentUrl" className="sr-only">
                Google Drive URL
              </label>
              <input
                type="url"
                id="attachmentUrl"
                name="attachmentUrl"
                className="w-full rounded border-gray-300"
                placeholder="Google Drive URL"
              />
            </div>
          </div>
          <button
            type="submit"
            className="bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded"
          >
            Create Post
          </button>
        </form>
      </div>

      {/* Display Posts */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Posts</h3>
        {posts.length === 0 ? (
          <p>No posts available.</p>
        ) : (
          posts.map((post) => (
            <div key={post._id} className="bg-gray-100 rounded p-4 mb-4">
              <h4 className="text-lg font-semibold">{post.heading}</h4>
              <p>{post.content}</p>
              {post.attachmentUrl && (
                <div className="mt-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Attachment URL:
                  </label>
                  <a
                    href={post.attachmentUrl}
                    className="text-blue-500 underline"
                    style={{
                      maxWidth: "300px", // Adjust the max width as needed
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                      display: "inline-block", // Ensure ellipsis works
                    }}
                    target="_blank" // Open in a new tab/window
                    rel="noopener noreferrer" // Recommended for security
                  >
                    {post.attachmentUrl}
                  </a>
                </div>
              )}
              {/* Display existing comments */}
              {post.comments && post.comments.length > 0 && (
                <div className="mt-4">
                  <h5 className="text-md font-semibold mb-2">Comments:</h5>
                  <ul>
                    {post.comments.map((comment, index) => (
                      <li key={index}>
                        <p>{comment}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <form
                onSubmit={(e) => handleCreateComment(post._id, e)}
                className="mt-4"
              >
                <input
                  type="text"
                  name="commentContent"
                  placeholder="Add a comment"
                  required
                />
                <button
                  type="submit"
                  className="bg-indigo-500 hover:bg-indigo-600 text-white py-1 px-2 rounded ml-2"
                >
                  {isCommentSubmittingMap[post._id] ? (
                    <BeatLoader color="#fff" size={8} />
                  ) : (
                    "Add Comment"
                  )}
                </button>
              </form>
            </div>
          ))
        )}
      </div>

      {/* Invite Student Popup */}
      {isInvitePopupOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-semibold mb-2">
              Invite Student by Email
            </h2>
            <input
              type="email"
              className="w-full rounded border-gray-300 mb-2"
              placeholder="Enter Email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />
            <div className="flex justify-end">
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded mr-2"
                onClick={handleInviteSubmit}
              >
                Send Invite
              </button>
              <button
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded"
                onClick={() => setIsInvitePopupOpen(false)} // Close the invite popup
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Classroom;
