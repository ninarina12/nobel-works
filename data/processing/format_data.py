import numpy as np
import pandas as pd
import json

chemistry_path = 'Chemistry publication record.csv'
medicine_path = 'Medicine publication record.csv'
physics_path = 'Physics publication record.csv'
interval = 4

def get_data(paths, categories):
	df = pd.read_csv(paths[0], sep=',', header=0, encoding='latin-1',
					 names=['laureate ID', 'laureate', 'prize year', 'title', 'pub year',
					 'paper ID', 'DOI', 'journal', 'affiliation', 'prize-winning'])
	df['discipline'] = categories[0]

	for i, path in enumerate(paths[1:]):
		df_app = pd.read_csv(path, sep=',', header=0, encoding='latin-1',
					 		 names=['laureate ID', 'laureate', 'prize year', 'title', 'pub year',
					 		 'paper ID', 'DOI', 'journal', 'affiliation', 'prize-winning'])
		df_app['discipline'] = categories[i+1]
		df = df.append(df_app, ignore_index=True)

	df.loc[df['prize-winning']=='YES', 'prize-winning'] = 1
	df.loc[df['prize-winning']=='NO', 'prize-winning'] = 0

	df = df.dropna(subset=['title']).drop_duplicates(subset=['title']).reset_index(drop=True)
	return df

def fill_affiliation(df, drop=False):
	laureates = np.unique(df['laureate'])
	s = df[df['laureate']==laureates[0]].copy()
	s.sort_values('pub year')
	s.fillna(method='bfill', inplace=True)
	df_fill = s.copy()
	print('unknown:',len(df[df['affiliation'].isnull()]))

	for laureate in laureates[1:]:
		s = df[df['laureate']==laureate].copy()
		s.sort_values('pub year')
		s.fillna(method='bfill', inplace=True)
		df_fill = df_fill.append(s, ignore_index=True)

	print('unknown:',len(df_fill[df_fill['affiliation'].isnull()]))
	if drop:
		# drop remaining NaN
		df_fill = df_fill.dropna().reset_index(drop=True)
	else:
		# set remaining NaN to 'unknown' affiliation
		df_fill.loc[df_fill['affiliation'].isnull(), 'affiliation'] = 'unknown'
	return df_fill

def bin_data(df, col, bin_edges = [None]):
	df = df.sort_values(col).reset_index(drop=True)
	if bin_edges[0] == None:
		bin_edges = list(np.arange(df[col].min(),df[col].max(),interval))+[df[col].max()+0.1]
	df[col+' (bin)'] = pd.cut(df[col], bin_edges, right=False)
	return df, bin_edges

def refine_data(df, col, bin_edges):
	bincol = col+' (bin)'
	group_list = df[bincol].value_counts(sort=False)
	group_keys = group_list.index.get_level_values(0)
	drop_ids = np.argwhere(group_list.values==0)
	if len(drop_ids)!=0:
		drop_list = group_keys[0:np.max(drop_ids)]
		df = df[~df[bincol].isin(drop_list)]
		df, bin_edges = bin_data(df, col)
	return df, bin_edges

def reorder_columns(df):
	cols = df.columns.tolist()
	cols = cols[-1:] + cols[:-1]
	df = df[cols]
	return df

def make_counts_datafile_by_category(df, group_col, counts_col, bin_edges, data_prefix):
	df_group = df.groupby(group_col, sort=True)[counts_col].value_counts(sort=False)
	p = np.zeros(shape=(len(bin_edges)-1, len(np.unique(df[counts_col]))))
	df_counts = pd.DataFrame(p, columns=list(np.unique(df[counts_col])))
	df_counts['date'] = bin_edges[:len(bin_edges)-1]

	df_group2 = df.groupby([group_col, counts_col], sort=True)['prize-winning'].sum(sort=False).dropna()
	df_prizes = pd.DataFrame(np.copy(p), columns=list(np.unique(df[counts_col])))
	df_prizes['date'] = bin_edges[:len(bin_edges)-1]

	for i in range(len(bin_edges)-1):
		laureates = df_group[np.unique(df_group.index.get_level_values(0))[i]]
		laureates2 = df_group2[np.unique(df_group2.index.get_level_values(0))[i]]
		laureate_name = laureates.index.get_level_values(0).values
		laureate_pubs = laureates.values
		laureate_prizes = laureates2.values
		for j in range(len(laureate_pubs)):
			df_counts.loc[df_counts['date']==bin_edges[i], laureate_name[j]] = laureate_pubs[j]
			df_prizes.loc[df_prizes['date']==bin_edges[i], laureate_name[j]] = laureate_prizes[j]

	df_counts['date'] += interval/2.
	df_counts = reorder_columns(df_counts)

	df_prizes['date'] += interval/2.
	df_prizes = reorder_columns(df_prizes)

	df_counts.to_csv(data_prefix + '_data.csv', index=False, header=True)
	df_prizes.to_csv(data_prefix + '_prizes.csv', index=False, header=True)

def make_counts_datafile(df, group_col, counts_col, bin_edges, data_prefix, cat_dict):
	df_group = df.groupby(group_col, sort=True)[counts_col].value_counts(sort=False)
	p = np.zeros(shape=(len(bin_edges)-1, len(np.unique(df[counts_col]))))
	df_counts = pd.DataFrame(p, columns=list(np.unique(df[counts_col])))
	df_counts['date'] = bin_edges[:len(bin_edges)-1]

	df_group2 = df.groupby([group_col, counts_col], sort=True)['prize-winning'].sum(sort=False).dropna()
	df_prizes = pd.DataFrame(np.copy(p), columns=list(np.unique(df[counts_col])))
	df_prizes['date'] = bin_edges[:len(bin_edges)-1]

	df_category = pd.DataFrame(np.copy(p), columns=list(np.unique(df[counts_col])))
	df_category['date'] = bin_edges[:len(bin_edges)-1]

	for i in range(len(bin_edges)-1):
		laureates = df_group[np.unique(df_group.index.get_level_values(0))[i]]
		laureates2 = df_group2[np.unique(df_group2.index.get_level_values(0))[i]]
		laureate_name = laureates.index.get_level_values(0).values
		laureate_pubs = laureates.values
		laureate_prizes = laureates2.values
		for j in range(len(laureate_pubs)):
			cat = df.loc[df['laureate']==laureate_name[j], 'discipline'].iloc[0]
			df_counts.loc[df_counts['date']==bin_edges[i], laureate_name[j]] = laureate_pubs[j]-1
			df_prizes.loc[df_prizes['date']==bin_edges[i], laureate_name[j]] = laureate_prizes[j]
			df_category.loc[df_prizes['date']==bin_edges[i], laureate_name[j]] = cat_dict[cat]

	df_counts['date'] += interval/2.
	df_counts = reorder_columns(df_counts)

	df_prizes['date'] += interval/2.
	df_prizes = reorder_columns(df_prizes)

	df_category['date'] += interval/2.
	df_category = reorder_columns(df_category)

	df_counts.to_csv(data_prefix + '_data.csv', index=False, header=True)
	df_prizes.to_csv(data_prefix + '_prizes.csv', index=False, header=True)
	df_category.to_csv(data_prefix + '_discipline.csv', index=False, header=True)

def make_json(df, savename):
	def split_df(df):
	    for discipline, df_discipline in df.groupby(['discipline']):
	        yield {
	            'name': discipline,
	            'children': list(split_category(df_discipline))
	        }

	def split_category(df):
	    for affiliation, df_affiliation in df.groupby('affiliation'):
	        yield {
	            'name': affiliation,
	            'children': list(split_subcategory(df_affiliation)),
	        }

	def split_subcategory(df):
	    for row in df.itertuples():
	        yield {'name': row.laureate, 'value': row.count}

	discipline_dict = dict({'name': 'data', 'children': list(split_df(df))})
	json_object = json.dumps(discipline_dict, indent=3)
	with open(savename, 'w') as outfile: 
	    outfile.write(json_object)

###########################################################################################

categories = ['chemistry', 'medicine', 'physics']
universities = ['california institute of technology', 'columbia university',
				'cornell university', 'harvard university', 'massachusetts institute of technology',
				'max planck society', 'princeton university', 'rockefeller university',
				'stanford university', 'university of cambridge', 'university of chicago', 'yale university']
cat_dict = {categories[0]: 0, categories[1]: 1, categories[2]: 2}

df = get_data([chemistry_path, medicine_path, physics_path], categories)
df = fill_affiliation(df, drop=True)

# hierarchical structure
df_grouped = pd.DataFrame({'count' : df.groupby(['discipline', 'affiliation', 'laureate']).size()}).reset_index()
make_json(df_grouped, 'data.json')

# tabular structure
for cat in categories:
	df_cat = df[df['discipline']==cat]
	df_cat, bin_edges = bin_data(df_cat, 'pub year')
	df_cat, bin_edges = refine_data(df_cat, 'pub year', bin_edges)
	make_counts_datafile_by_category(df_cat, 'pub year (bin)', 'laureate', bin_edges, cat)

# tabular by affiliation
df_cat = df[df['discipline']==categories[1]]
df_cat, bin_edges = bin_data(df_cat, 'pub year')
df_cat, bin_edges = refine_data(df_cat, 'pub year', bin_edges)
bins = np.unique(df_cat['pub year (bin)'])
y0 = df_cat['pub year'].values.min()
for uni in universities:
	print(uni)
	df_uni = df[df['affiliation']==uni]
	df_uni = df_uni[df_uni['pub year']>=y0]
	df_uni, _ = bin_data(df_uni, 'pub year', bin_edges)

	laureates = np.unique(df_uni['laureate'])
	for laureate in laureates:
		s = df_uni[df_uni['laureate']==laureate].copy().iloc[0:1]
		for b in bins:
			s['pub year (bin)'] = b
			s['prize-winning'] = 0
			df_uni = df_uni.append(s, ignore_index=True)
	make_counts_datafile(df_uni, 'pub year (bin)', 'laureate', bin_edges, '_'.join(uni.split(' ')), cat_dict)

# prize-winning
df_cat = df[df['discipline']==categories[1]]
df_cat, bin_edges = bin_data(df_cat, 'pub year')
df_cat, bin_edges = refine_data(df_cat, 'pub year', bin_edges)
bins = np.unique(df_cat['pub year (bin)'])
y0 = df_cat['pub year'].values.min()

uni = universities[0]
print(uni)
df_uni = df[df['affiliation']==uni]
df_uni = df_uni[df_uni['pub year']>=y0]
df_uni = df_uni[df_uni['prize-winning']==1]
df_prizes = pd.DataFrame({'pub': df_uni['pub year'], 'prize': df_uni['prize year'],
						  'discipline': df_uni['discipline'], 'affiliation': [uni]*len(df_uni),
						  'laureate': df_uni['laureate']})
for uni in universities[1:]:
	print(uni)
	df_uni = df[df['affiliation']==uni]
	df_uni = df_uni[df_uni['pub year']>=y0]
	df_uni = df_uni[df_uni['prize-winning']==1]
	s = pd.DataFrame({'pub': df_uni['pub year'], 'prize': df_uni['prize year'],
					  'discipline': df_uni['discipline'], 'affiliation': [uni]*len(df_uni),
					  'laureate': df_uni['laureate']})
	df_prizes = df_prizes.append(s, ignore_index=True)
df_prizes.to_csv('selected_prizes.csv', index=False, header=True)

