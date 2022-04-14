import axios from "axios";
import type { NextPage } from "next";
import { QueryFunctionContext, useQueries, useQuery } from "react-query";

interface Post {
  id: number;
  title: string;
  author: string;
  description: string;
}

const getPost = async (query: QueryFunctionContext) => {
  const { data } = await axios.get<Post>(
    `http://localhost:5000/posts/${query.queryKey[1]}`
  );
  return data;
};

const ParallelQueriesPage: NextPage = () => {
  // useQuery<Post, Error>(["post", 1], getPost);
  // useQuery<Post, Error>(["post", 2], getPost);
  // useQuery<Post, Error>(["post", 3], getPost);

  useQueries([
    { queryKey: ["post", 1], queryFn: getPost },
    { queryKey: ["post", 2], queryFn: getPost },
    { queryKey: ["post", 3], queryFn: getPost },
  ]);

  return <div>Parallel Queries Page</div>;
};

export default ParallelQueriesPage;
