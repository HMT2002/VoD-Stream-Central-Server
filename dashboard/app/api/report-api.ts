import axios from "axios";
import { url } from "@/app/lib/constants";
import { Topic, Notification, Report } from "../types/types";

export async function POSTaddReport({
  report,
  teacher_id,
}: {
  report: Report;
  teacher_id: string;
}) {
  try {
    console.log("Report: " + report);
    await axios
      .post(url + `v1/report/addReport/${teacher_id}`, {
        loai_bao_cao: report?.loai_bao_cao,
        noi_dung: report?.noi_dung,
        ngay_bat_dau: report?.ngay_bat_dau,
        ngay_ket_thuc: report?.ngay_ket_thuc,
        file: report?.file,
      })
      .then((res) => {
        console.log(
          "Tạo report thành công: " +
            res.data.loai_bao_cao +
            ", " +
            res.data.noi_dung
        );
      });
  } catch (err) {
    throw err;
  }
}

export async function PUTupdateStatusReport({
  studentID,
  reportID,
  file,
  loai_bao_cao,
}: {
  studentID: string;
  reportID: string;
  file: File;
  loai_bao_cao: string;
}) {
  try {
    const formData = new FormData();
    if (loai_bao_cao) formData.append("loai_bao_cao", loai_bao_cao);
    if (file) formData.append("file", file);
    await axios.put(
      url + `v1/report/done_report/${studentID}&${reportID}`,
      formData
    );
  } catch (err) {
    throw err;
  }
}

export async function GETgetReportByID(report_id: string | undefined) {
  try {
    const response = await axios.get(
      url + `v1/report/getReportById/${report_id}`
    );
    console.log("Report Item: " + response.data);
    return response.data;
  } catch (err) {
    throw err;
  }
}

export async function GETgetSubmitReportByReportID(
  report_id: string | undefined
) {
  try {
    const response = await axios.get(
      url + `v1/submitReport/getSubmitReportById/${report_id}`
    );
    return response.data;
  } catch (err) {
    throw err;
  }
}
