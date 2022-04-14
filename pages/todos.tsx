import type { NextPage } from "next";
import { useMutation, useQuery, useQueryClient } from "react-query";
import axios from "axios";
import { ChangeEvent, FormEvent, Fragment, useCallback, useState } from "react";

interface Todo {
  id: number;
  todo: string;
  done: boolean;
}

const getTodos = async () => {
  const { data } = await axios.get<Todo[]>("http://localhost:5000/todos");
  return data;
};

const addTodo = async (todo: string) => {
  const { data } = await axios.post<Todo>("http://localhost:5000/todos123", {
    todo,
    done: false,
  });

  return data;
};

const TodosPage: NextPage = () => {
  const [todo, setTodo] = useState("");

  const queryClient = useQueryClient();

  const {
    data: todos,
    isLoading,
    isError,
    error,
  } = useQuery<Todo[], Error>("todos", getTodos, {
    refetchOnWindowFocus: false,
  });

  const { mutate } = useMutation<
    Todo,
    Error,
    string,
    { previousTodos: Todo[] | undefined }
  >(addTodo, {
    // onSuccess: (data) => {
    //   //   queryClient.invalidateQueries("todos");
    //   queryClient.setQueryData<Todo[]>("todos", (oldData) => {
    //     if (!oldData) {
    //       return [];
    //     }

    //     return [...oldData, { id: data.id, todo: data.todo, done: false }];
    //   });
    // },

    onMutate: async (newTodo) => {
      await queryClient.cancelQueries("todos");

      const previousTodos = queryClient.getQueryData<Todo[]>("todos");

      queryClient.setQueryData<Todo[]>("todos", (oldData) => {
        if (!oldData) {
          return [];
        }

        return [
          ...oldData,
          { id: oldData.length + 1, todo: newTodo, done: false },
        ];
      });

      return { previousTodos };
    },

    onError: (_error, _newTodo, context) => {
      queryClient.setQueryData("todos", context?.previousTodos);
    },
    // onSettled: () => {
    //   queryClient.invalidateQueries("todos");
    // },
  });

  const onSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      mutate(todo);
      setTodo("");
    },
    [mutate, todo]
  );

  if (isError) {
    return <div>{error.message}</div>;
  }

  return (
    <>
      <form onSubmit={onSubmit}>
        <label>할 일: </label>
        <input
          type="text"
          value={todo}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setTodo(e.target.value)
          }
        />
        <button type="submit">작성</button>
      </form>

      <br />

      <div>
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          todos?.map((todo) => (
            <Fragment key={todo.id}>
              <div>ID: {todo.id}</div>
              <div>할 일: {todo.todo}</div>

              <br />
              <hr />
            </Fragment>
          ))
        )}
      </div>
    </>
  );
};

export default TodosPage;
