/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "standalone",
    transpilePackages: ["@hackmaxx/shared"],
};
export default nextConfig;
