const site = "https://bookinglist-api.onrender.com/";
const postReq = async (surl: string, data: {}, tok: string) => {
  const res = await fetch(site + surl, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: tok },
    body: JSON.stringify(data),
  });
  const dat = await res.json();
  return dat;
};

const putReq = async (surl: string, data: {}, tok: string) => {
  const res = await fetch(site + surl, {
    method: "PUT",
    headers: { "content-type": "application/json", authorization: tok },
    body: JSON.stringify(data),
  });
  const dat = await res.json();
  return dat;
};

const delReq = async (surl: string, data: {}, tok: string) => {
  const res = await fetch(site + surl, {
    method: "DELETE",
    headers: { "content-type": "application/json", authorization: tok },
    body: JSON.stringify(data),
  });
  const dat = await res.json();
  return dat;
};

const getReq = async (surl: string, tok: string) => {
  const res = await fetch(site + surl, {
    headers: { authorization: tok },
  });
  const dat = await res.json();
  return dat;
};

export { postReq, putReq, getReq, site, delReq };
