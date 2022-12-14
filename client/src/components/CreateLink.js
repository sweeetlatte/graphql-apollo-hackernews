import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, gql } from "@apollo/client";
import { AUTH_TOKEN, LINKS_PER_PAGE } from "../constants";
import { FEED_QUERY } from "./LinkList";

/**
 * Note 4:
 * Sending mutations with Apollo follows similar steps:
 * - Write the mutation as a JavaScript constant using the gql parser function
 * - Use the useMutation hook provided by Apollo Client to send mutations to GraphQL server
 * - Read the result of the mutation
 */
const CREATE_LINK_MUTATION = gql`
  mutation PostMutation($description: String!, $url: String!) {
    addLink(description: $description, url: $url) {
      id
      createdAt
      url
      description
    }
  }
`;

const CreateLink = () => {
  const navigate = useNavigate();
  const [formState, setFormState] = useState({
    description: "",
    url: "",
  });

  /**
   * Note 5:
   * Pass in the data provided in the input fields as variables
   *
   * When we use the useMutation hook, we need to destructure out a function that can be used to call the mutation - line 79
   */
  const [createLink] = useMutation(CREATE_LINK_MUTATION, {
    variables: {
      description: formState.description,
      url: formState.url,
    },
    update: (cache, { data: { post } }) => {
      const take = LINKS_PER_PAGE;
      const skip = 0;
      const orderBy = { createdAt: "desc" };

      const data = cache.readQuery({
        query: FEED_QUERY,
        variables: {
          take,
          skip,
          orderBy,
        },
      });

      cache.writeQuery({
        query: FEED_QUERY,
        data: {
          feed: {
            links: [post, ...data.feed.links],
          },
        },
        variables: {
          take,
          skip,
          orderBy,
        },
      });
    },
    /**
     * Note 7:
     * Implement an automatic redirect after a mutation is performed using the onCompleted function
     */
    onCompleted: () => navigate("/"),
  });

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          createLink();
        }}
      >
        <div className="flex flex-column mt3">
          <input
            className="mb2"
            value={formState.description}
            onChange={(e) =>
              setFormState({
                ...formState,
                description: e.target.value,
              })
            }
            type="text"
            placeholder="A description for the link"
          />
          <input
            className="mb2"
            value={formState.url}
            onChange={(e) =>
              setFormState({
                ...formState,
                url: e.target.value,
              })
            }
            type="text"
            placeholder="The URL for the link"
          />
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default CreateLink;
