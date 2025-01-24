export type Props = {
  id: string;
  title: string;
};
export default function Card({ title }: Props) {
  return (
    <div className="h-[300px] w-[200px] border-2 border-red-500 bg-white p-8 font-bold">
      {title}
    </div>
  );
}
