import ReviewReply from "@/components/ReviewReply";

export default function Home() {
	return (
		<main className="p-4 container max-w-5xl mx-auto">
			<div className="my-4">
				<h1 className="font-black text-xl">MARA Next.js / React example</h1>
				<p className="text-gray-500">
					The following app is a minimal example of streaming review replies
					with MARA. If you have any questions, please contact
					i.lange@mara.solutions.
				</p>
				<p className="text-gray-500 mt-2">
					The JWT token provided manually here should be generated and updated
					by your backend in production as needed.
				</p>
				<p className="text-gray-500 mt-2">
					In production, the smart snippets, which can be set directly here for
					simplicity, should be sent via a settings profile.
				</p>
			</div>
			<div className="mt-6">
				<ReviewReply />
			</div>
		</main>
	);
}
