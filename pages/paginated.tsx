import type { NextPage } from "next";
import { QueryFunctionContext, useQuery } from "react-query";
import axios from "axios";
import { Fragment, useState } from "react";

interface Post {
  id: number;
  title: string;
  author: string;
  description: string;
}

const getPosts = async ({ queryKey }: QueryFunctionContext) => {
  const { data } = await axios.get<Post[]>(
    `http://localhost:5000/posts?_limit=2&_page=${queryKey[1]}`
  );
  return data;
};

const PaginatedPage: NextPage = () => {
  const [page, setPage] = useState(1);
  const { data: posts, isLoading } = useQuery<Post[], Error>(
    ["paginated", page],
    getPosts,
    {
      keepPreviousData: true,
    }
  );

  return (
    <>
      <div>
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          posts?.map((post) => (
            <Fragment key={post.id}>
              <div>id: {post.id}</div>
              <div>제목: {post.title}</div>
              <div>작성자: {post.author}</div>
              <div>내용: {post.description.slice(0, 100)}...</div>
            </Fragment>
          ))
        )}
        <button
          onClick={() => setPage((page) => page - 1)}
          disabled={page === 1}
        >
          Prev Page
        </button>
        <button
          onClick={() => setPage((page) => page + 1)}
          disabled={page === 5}
        >
          Next Page
        </button>
      </div>
    </>
  );
};

export default PaginatedPage;
