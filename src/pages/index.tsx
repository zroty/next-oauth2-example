export default function Home() {

  const onSubmit = () => {
    window.location.href = '/api/oauth';
  }

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-slate-900">
      <button onClick={() => onSubmit()} className="p-4 bg-orange-500 hover:bg-orange-600 rounded-2xl hover:cursor-pointer">asdasdasd</button>
    </div>
  );
}
