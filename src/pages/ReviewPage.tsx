import { useState, useEffect } from 'react';
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import reviewService from '../services/reviewService';
import { Card, Avatar, Rating } from "@mui/material";


// const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A97E2B"];


const ReviewPage = () => {
  const [reviews, setReviews] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [replyTexts, setReplyTexts] = useState({});
  const [replies, setReplies] = useState({});
  const [replyVisible, setReplyVisible] = useState(null); // Track which reply input is visible
  const [sortOption, setSortOption] = useState("date");
  const [filterService, setFilterService] = useState("all");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await reviewService.getAllReview();
      setReviews(response);
      console.log(response);
    } catch (err) {
      console.log('Error fetching data');
    }
  };

  const handleApprove = async (id) => {
    try {
      const response = await reviewService.reviewApprove(id);
      if (response.status === 200) {
        setReviews((prevReviews) =>
          prevReviews.map((review) =>
            review.id === id ? { ...review, approved: 1 } : review
          )
        );
      }
    } catch (error) {
      console.error("Error approving review:", error);
    }
  };

  const handleDelete = (id) => {
    setReviews((prevReviews) => prevReviews.filter((review) => review.id !== id));
  };

  const handleReplyChange = (id, text) => {
    setReplyTexts((prev) => ({ ...prev, [id]: text }));
  };

  const handleReplyClick = (id) => {
    setReplyVisible((prev) => (prev === id ? null : id)); // Toggle reply input for the specific review
  };

  const handleReply = async (id) => {
    if (!replyTexts[id]?.trim()) return;
    try {
      const response = await reviewService.replyToReview(id, replyTexts[id]);
      if (response.status === 200) {
        setReplies({ ...replies, [id]: replyTexts[id] });
        setReplyTexts((prev) => ({ ...prev, [id]: "" }));
        setReplyVisible(null);
      }
    } catch (error) {
      console.error("Error sending reply:", error);
    }
  };
  const filteredReviews = reviews.filter((review) => {
    const matchesSearch = review.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          review.comment.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          review.service.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterStatus === "all" || (filterStatus === "approved" && review.approved) || (filterStatus === "pending" && !review.approved);
    
    const matchesService = filterService === "all" || review.service.toLowerCase() === filterService.toLowerCase();
    
    return matchesSearch && matchesFilter && matchesService;
  });

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    if (sortOption === "rating") return b.rating - a.rating;
    if (sortOption === "name") return a.name.localeCompare(b.name);
    return new Date(b.created_at) - new Date(a.created_at);
  });



// Group reviews by service category and calculate the average rating
const serviceCategories = ["Property", "Service", "Resource"];
const ratingByCategory = serviceCategories.map((category) => {
  const filteredReviews = reviews.filter((review) => review.service === category);
  const avgRating = filteredReviews.length
    ? filteredReviews.reduce((sum, review) => sum + review.rating, 0) / filteredReviews.length
    : 0;
  
  return { category, avgRating: avgRating.toFixed(1) };
});

// Calculate service type distribution for Pie Chart
const serviceTypeDistribution = serviceCategories.map((category) => ({
  service: category,
  count: reviews.filter((review) => review.service === category).length,
}));

  return (
    <>
      <Sidebar />
      <Header />
      <div className="p-4 sm:ml-64">
        <div className='mb-4 flex align-items-center justify-between'>
          <input type="text" placeholder="Search review ..."
            className="px-4 py-2 bg-gray-100 focus:bg-transparent w-full text-md outline-[#333] rounded-sm transition-all max-w-[240px] mr-4" 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className='px-4 py-2 bg-[#a97e2b] rounded-sm text-white'
          >
            <option value="all">All Reviews</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        <div className='mb-4 flex align-items-center'>
        <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}
            className='px-4 py-2 rounded-md text-black mx-2 border'>
            <option value="date">Sort by Date</option>
            <option value="rating">Sort by Rating</option>
            <option value="name">Sort by Name</option>
          </select>
          <select value={filterService} onChange={(e) => setFilterService(e.target.value)}
            className='px-4 py-2 rounded-md text-black mx-2 border'>
            <option value="all">All Services</option>
            <option value="property">Property</option>
            <option value="resource">Resource</option>
            <option value="service">Service</option>
          </select>
        </div>



       {/* Graph Overview */}
       <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Average Rating per Service */}
          {/* <div className="bg-white shadow p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Average Rating per Service</h2>
            <BarChart width={500} height={300} data={ratingByCategory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis domain={[0, 5]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="avgRating" fill="#A97E2B" barSize={40} />
            </BarChart>
          </div> */}

          {/* Service Type Distribution
          <div className="bg-white shadow p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Review Count by Service</h2>
            <PieChart width={400} height={300}>
              <Pie
                data={serviceTypeDistribution}
                dataKey="count"
                nameKey="service"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#A97E2B"
                label
              >
                {serviceTypeDistribution.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </div> */}

        </div>


        <div className="columns-1 sm:columns-2 lg:columns-4 space-y-4">
          {sortedReviews.map((review) => (
            <Card key={review.id} className="relative shadow-sm p-4 rounded-lg bg-white relative">
              <div className="flex items-center mb-2">
                <Avatar className="bg-black text-white mr-4">
                  {review.name.charAt(0)}
                </Avatar>
                <div>
                  <h3 className="text-sm font-semibold truncate w-[200px] mb-0">{review.name}</h3>
                  <p className="text-sm text-gray-500 mb-0">{new Date(review.created_at).toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center mb-4 mt-3">
                <Rating value={review.rating} precision={0.1} readOnly className="text-[#a97e2b]" />
                <p className="ml-2 text-sm font-medium text-gray-700 mb-0">{review.rating}</p>
              </div>
              <p className="text-gray-600 text-sm line-clamp-3">{review.comment}</p>
              <div className="space-x-2 mt-3 flex">
                {!review.approved && (
                  <button onClick={() => handleApprove(review.id)}
                    className="px-2 py-2 rounded-lg text-sm tracking-wider font-medium border border-green-700 outline-none bg-transparent hover:bg-green-700 text-green-700 hover:text-black transition-all duration-300">
                    Approve
                  </button>
                )}
                <button onClick={() => handleDelete(review.id)}
                  className="px-2 py-2 rounded-lg text-sm tracking-wider font-medium border border-black-700 outline-none bg-transparent hover:bg-black-700 text-black-700 hover:text-red transition-all duration-300">
                  Delete
                </button>
                {/* <button onClick={() => handleReplyClick(review.id)}
                 
                </button> */}
                <span
                onClick={() => handleReplyClick(review.id)}
                className="absolute px-2 py-2 rounded-lg text-sm tracking-wider font-medium text-blue-700 transition-all duration-300 cursor-pointer top-1 right-1">
                  Reply
                </span>
              </div>

              {/* Reply Input Section */}
              {replyVisible === review.id && (
                <div className="mt-4">
                  <input 
                    type="text" 
                    placeholder="Reply to review..." 
                    value={replyTexts[review.id] || ""}
                    onChange={(e) => handleReplyChange(review.id, e.target.value)}
                    className="px-2 py-1 border rounded w-full" 
                  />
                  <button onClick={() => handleReply(review.id)}
                    className="mt-2 px-2 py-1 bg-black text-white rounded text-sm">Send Reply</button>
                </div>
              )}

              {/* Display Reply */}
              {replies[review.id] && (
                <div className="mt-2 p-2 bg-gray-100 rounded">
                  <strong>Admin:</strong> {replies[review.id]}
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </>
  );
};

export default ReviewPage;
