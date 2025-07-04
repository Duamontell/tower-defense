export const Waypoints = [
	{
		type: 'bezier',
		from: { x: 50, y: 50 },
		to: { x: 250, y: 250 },
		control: { x: 50, y: 400 }
	},
	{
		type: 'bezier',
		from: { x: 250, y: 250 },
		to: { x: 250, y: 100 },
		control: { x: 120, y: 150 }
	},
	{
		type: 'linear',
		from: { x: 250, y: 100 },
		to: { x: 350, y: 150 }
	},
	{
		type: 'bezier',
		from: { x: 350, y: 150 },
		to: { x: 350, y: 300 },
		control: { x: 400, y: 225 }
	}
];