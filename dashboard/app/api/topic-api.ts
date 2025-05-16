import axios from "axios";
import { useSession } from "next-auth/react";
import { url } from "@/app/lib/constants";
import { Topic } from "../types/types";

export async function POSTaddTopic({
  topic,
  teacher_id,
}: {
  topic: Topic;
  teacher_id: string;
}) {
  try {
    await axios.post(url + `v1/topic/addTopic/${teacher_id}`, {
      topic_name: topic.topic_name,
      topic_description: topic.topic_description,
    });
  } catch (err) {
    // * Re-throw the error to make sure the promise is rejected
    throw err;
  }
}

export async function DELETEdeleteTopic(topic_id: string) {
  try {
    await axios.delete(url + `v1/topic/deleteTopic/${topic_id}`);
  } catch (err) {
    throw err;
  }
}

export async function GETsearchTopic(search_string: string) {
  try {
    await axios.put(url + `v1/topic/searchTopic`, {
      search_string: search_string,
    });
  } catch (err) {
    throw err;
  }
}

export async function GETgetAllTopic() {
  try {
    // const response = await axios.get(url + `v1/topic/getAllTopic`);
    const response = await axios.get(url + `v1/topic/getAllTopic`);
    return response.data;
  } catch (err) {
    throw err;
  }
}

export async function GETgetASingleTopic(topic_id: string) {
  try {
    await axios.get(url + `v1/topic/getASingleTopic/${topic_id}`);
  } catch (err) {
    throw err;
  }
}

export async function PUTupdateTopic(topic: Topic) {
  try {
    await axios.put(url + `v1/topic/updateTopic/${topic._id}`, {
      topic_name: topic.topic_name,
      topic_description: topic.topic_description,
    });
  } catch (err) {
    throw err;
  }
}

export async function POSTregisterTopic(student_id: string, topic_id: string) {
  try {
    await axios.post(
      url + `v1/registerTopic/registerTopic/` + student_id + "&" + topic_id
    );
  } catch (err) {
    throw err;
  }
}

export async function GETsearchRegisterTopic() {
  try {
    await axios.get(url + `v1/registerTopic/searchRegisterTopic`);
  } catch (err) {
    throw err;
  }
}

export async function GETgetAllRegisterTopic() {
  try {
    const response = await axios.get(
      url + `v1/registerTopic/getAllRegisterTopic`
    );
    // console.log(response.data);
    return response.data;
  } catch (err) {
    throw err;
  }
}

export async function PUTStudentRequestChangeTopic({
  student_id,
  new_topic_id,
}: {
  student_id: string;
  new_topic_id: string;
}) {
  try {
    await axios.put(
      url + `v1/registerTopic/changeTopic/${student_id}&${new_topic_id}`
    );
  } catch (err) {
    throw err;
  }
}

export async function PUTTeacherConfirmRequestChangeTopic({
  student_id,
}: {
  student_id: string;
}) {
  try {
    await axios.put(
      url + `v1/registerTopic/teacherConfirmChangeTopic/${student_id}`
    );
  } catch (err) {
    throw err;
  }
}
