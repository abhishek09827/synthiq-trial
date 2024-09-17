
export default function Home() {
	const callAPI = async () => {
		try {
			const res = await fetch(
				`http://localhost:3000/api/calls`
			);
			const data = await res.json();
			console.log(data);
		} catch (err) {
			console.log(err);
		}
	};
	return (
		<div >
			<main >
				<button onClick={callAPI}>Make API Call</button>
			</main>
		</div>
	);
}