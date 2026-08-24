export const IconoServicio = ({ svgString, color }: { svgString?: any; color?: any }) => {
	return (
		<>
			<div
				dangerouslySetInnerHTML={{ __html: svgString }}
				className={`h-5 w-5 fill-${color}`}
			/>
		</>
	);
};
