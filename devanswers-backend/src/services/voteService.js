export const handleVote = async (Model, id, userId, voteType) => {
  const document = await Model.findById(id);
  if (!document) {
    throw new Error("Document not found");
  }

  const hasUpvoted = document.upvotes.includes(userId);
  const hasDownvoted = document.downvotes.includes(userId);

  if (
    (voteType === "upvote" && hasUpvoted) ||
    (voteType === "downvote" && hasDownvoted)
  ) {
    return document; // Do nothing, no change needed
  }

  // Remove existing votes
  if (hasUpvoted) {
    document.upvotes.pull(userId);
  }
  if (hasDownvoted) {
    document.downvotes.pull(userId);
  }

  // Add new vote
  if (voteType === "upvote") {
    document.upvotes.push(userId);
  } else if (voteType === "downvote") {
    document.downvotes.push(userId);
  }

  // Update vote count
  document.voteCount = document.upvotes.length - document.downvotes.length;

  await document.save();
  return document;
};
