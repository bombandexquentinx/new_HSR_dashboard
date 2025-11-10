
import app from "../utils/api";

const getAllReview = async () => {
const response = await app.get("/reviews");

return response.data;
}
const reviewApprove = async (id) => {
const response = await app.patch(`/reviews/${id}/approve`);

return response.data;
}

  

const reviewService = {
    getAllReview,
    reviewApprove
};

export default reviewService;


