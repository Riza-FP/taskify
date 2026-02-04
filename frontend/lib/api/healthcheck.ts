export async function healthcheck() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/healthcheck`
  );

  if (!res.ok) {
    throw new Error("Backend not healthy");
  }

  return res.json();
}
