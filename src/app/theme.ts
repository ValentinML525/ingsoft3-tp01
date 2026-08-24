import { Theme } from '@/components/Client/MaterialTailwindClient';

const theme: Theme = {
	input: {
		defaultProps: {
			variant: 'standard',
			size: 'lg',
			color: 'light-green',
		},
		styles: {
			base: {
				input: {
					fontSize: 'text-lg',
				},
				label: {
					disabled: 'opacity-100 text-gray-700',
				},
			},
			variants: {
				standard: {
					base: {
						label: {
							fontSize: 'text-md',
							floated: {
								fontSize: 'text-[16px] peer-focus:text-[18px]',
							},
						},
					},
					sizes: {
						lg: {
							container: {
								height: 'h-14',
							},
							input: {
								fontSize: 'text-md',
								px: 'px-px',
								pt: 'pt-5',
								pb: 'pb-2',
							},
							label: {
								lineHeight: 'peer-placeholder-shown:leading-[4.875]',
							},
						},
					},
				},
			},
		},
	},
	textarea: {
		defaultProps: {
			variant: 'standard',
			size: 'lg',
			color: 'light-green',
		},
		styles: {
			base: {
				input: {
					fontSize: 'text-lg',
				},
				label: {
					disabled: 'opacity-100 text-gray-700',
				},
			},
			variants: {
				standard: {
					base: {
						label: {
							fontSize: 'text-md',
							floated: {
								fontSize: 'text-[16px] peer-focus:text-[18px]',
							},
						},
					},
					sizes: {
						lg: {
							container: {
								height: 'h-14',
							},
							textarea: {
								fontSize: 'text-lg',
								px: 'px-px',
								pt: 'pt-5',
								pb: 'pb-2',
							},
						},
					},
				},
			},
		},
	},
	select: {
		defaultProps: {
			variant: 'standard',
			size: 'lg',
			color: 'light-green',
		},
		styles: {
			base: {
				menu: {
					fontSize: 'text-lg',
				},
				label: {
					fontSize: 'text-lg',
					disabled: 'opacity-100 text-gray-700',
				},
				arrow: {
					initial: {
						top: 'top-3/5',
					},
					active: {
						transform: 'rotate-180',
						mt: 'mt-px',
					},
				},
				option: {
					initial: { fontSize: 'text-lg' },
					active: {
						fontSize: 'text-lg',
					},
				},
			},
			variants: {
				standard: {
					base: {
						label: {
							floated: {
								fontSize: 'text-[16px] peer-focus:text-[18px]',
							},
						},
					},
					sizes: {
						lg: {
							select: {
								fontSize: 'text-lg',
							},
							container: {
								height: 'h-14',
							},
							input: {
								fontSize: 'text-lg',
							},
							label: {
								initial: {},
								states: {
									close: {
										lineHeight: 'leading-[5.0]',
										fontsize: 'text-md',
									},
									open: {
										lineHeight: 'leading-tight',
										fontsize: 'text-sm',
									},
									withValue: {
										lineHeight: 'leading-tight',
										fontsize: 'text-md',
									},
								},
							},
						},
					},
				},
			},
		},
	},
};

export default theme;
