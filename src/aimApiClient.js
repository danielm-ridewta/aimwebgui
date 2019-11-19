const aimApiBaseUrl = "http://srvwebnode3:3030/v1";
let token = "";
let dispatchVideoToken = "";
let AIM_DispatchutilsToken = "";

function buildQueryString(parameters) {
  return Object.keys(parameters).reduce((acc, cur, idx, arr) => {
    return `${acc}${encodeURIComponent(cur)}=${encodeURIComponent(
      parameters[cur]
    )}${idx < arr.length - 1 ? "&" : ""}`;
  }, "?");
}

async function fetchJson(url, { method, body } = {}) {
  let response;
  if (method === "POST") {
    response = await fetch(url, {
      method,
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body)
    });
  } else {
    response = await fetch(url);
  }

  if (response.status === 204) {
    return;
  }
  const json = await response.json();
  return json;
}

export async function AIM_DispatchUtilsLogin(username, password) {
  const response = await fetchJson(`${aimApiBaseUrl}/login`, {
    method: "POST",
    body: {
      username,
      password
    }
  });

  if (response.error) {
    return { error: response.error };
  }

  AIM_DispatchutilsToken = response.token;

  return response;
}

export async function dispatchVideoLogin(username, password) {
  const response = await fetchJson(`${aimApiBaseUrl}/login`, {
    method: "POST",
    body: {
      username,
      password
    }
  });

  if (response.error) {
    return { error: response.error };
  }

  dispatchVideoToken = response.token;

  return response;
}

export async function login(username, password) {
  const response = await fetchJson(`${aimApiBaseUrl}/login`, {
    method: "POST",
    body: {
      username,
      password
    }
  });

  if (response.error) {
    return { error: response.error };
  }

  token = response.token;

  return response;
}

export async function getDevices(useAIM_DispatchutilsToken = false) {
  const response = await fetchJson(
    `${aimApiBaseUrl}/devices${buildQueryString({
      token: useAIM_DispatchutilsToken ? AIM_DispatchutilsToken : token
    })}`
  );

  if (response.error) {
    return { error: response.error };
  }

  return response;
}

export async function getChannels() {
  const response = await fetchJson(
    `${aimApiBaseUrl}/channels${buildQueryString({ token })}`
  );

  if (response.error) {
    return { error: response.error };
  }
  return response;
}

export async function getPresets() {
  const response = await fetchJson(
    `${aimApiBaseUrl}/presets${buildQueryString({ token })}`
  );

  if (response.error) {
    return { error: response.error };
  }
  return response;
}

export async function connectChannel(
  channelId,
  deviceId,
  useDispatchVideoToken
) {
  const response = await fetchJson(
    `${aimApiBaseUrl}/channels/${channelId}/connect${buildQueryString({
      token: useDispatchVideoToken ? dispatchVideoToken : token,
      deviceId
    })}`,
    {
      method: "POST"
    }
  );

  if (response && response.error) {
    return { error: response.error };
  }

  return response;
}

export async function connectPreset(presetId) {
  const response = await fetchJson(
    `${aimApiBaseUrl}/presets/connect${buildQueryString({ token, presetId })}`,
    {
      method: "POST"
    }
  );

  if (response && response.error) {
    return { error: response.error };
  }

  return response;
}
