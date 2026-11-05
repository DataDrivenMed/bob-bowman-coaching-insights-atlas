"""Builds guide.json: the reader-facing overlay (situations, audiences, idea
cleanup, study principles). threads.json and weekly-updates.json are read only.
Run: python3 -I build_guide.py <repo_dir>"""
import json, sys, pathlib

repo = pathlib.Path(sys.argv[1])
base = json.loads((repo / 'threads.json').read_text())
weekly = json.loads((repo / 'weekly-updates.json').read_text())
threads = [t for t in base['threads'] + weekly['threads'] if not t.get('sample')]
by_suffix = {}
for t in threads:
    s = t['id'][-6:]
    assert s not in by_suffix, s
    by_suffix[s] = t['id']

situations = [
    dict(id='planning-the-season', title='Planning the season',
         question='How do I turn a big goal into work my swimmers do every day?',
         blurb='Long-range goals, seasonal targets and the ordinary morning that connects them.',
         audience=['coach', 'swimmer']),
    dict(id='better-practice', title='Running better practice',
         question='How do I make practice count, not just add yards?',
         blurb='Standards, repetition, fundamentals and doing the work correctly.',
         audience=['coach', 'swimmer']),
    dict(id='training-design', title='Training design and technique',
         question='What does he think about volume, intensity, drills and suits?',
         blurb='His views on training stimulus, recovery, race specifics and equipment.',
         audience=['coach']),
    dict(id='big-meet', title='Before a big meet',
         question='What should we do, and stop doing, in the run-up to championships?',
         blurb='Trusting completed work, simplifying on race day and preparing for disruption.',
         audience=['coach', 'swimmer']),
    dict(id='confidence-mental', title='Confidence and mental skills',
         question='How do I help an athlete stay composed and believe in the work?',
         blurb='Earned confidence, visualization, relaxation and focus on the next controllable action.',
         audience=['swimmer', 'coach']),
    dict(id='motivation', title='Motivation and commitment',
         question='How do I keep athletes showing up when they don\'t feel like it?',
         blurb='Consistency over feelings, ownership and a reason behind repetitive work.',
         audience=['swimmer', 'coach']),
    dict(id='setbacks', title='Setbacks, plateaus and slumps',
         question='My swimmer has stalled or had a bad race. What now?',
         blurb='Patience with delayed progress, adapting the plan and finding the next workable step.',
         audience=['swimmer', 'coach', 'parent']),
    dict(id='after-the-result', title='After the result',
         question='How do we review a meet and reset, especially after a big win?',
         blurb='Keeping records, adjusting plans and handling success without stalling.',
         audience=['coach', 'swimmer']),
    dict(id='young-swimmers', title='Developing young swimmers',
         question='What matters most with age-group kids?',
         blurb='Long-term development, varied activity, fundamentals over early talent and room to fail.',
         audience=['parent', 'coach']),
    dict(id='team-culture', title='Team culture and environment',
         question='How do I build a group that holds a high standard together?',
         blurb='Team values, honest feedback, coaching individuals inside a group and support around the athlete.',
         audience=['coach']),
    dict(id='growing-as-a-coach', title='Growing as a coach',
         question='How do I keep improving at this job, and stay in it?',
         blurb='Learning from better coaches, guiding instead of controlling, self-care and career persistence.',
         audience=['coach']),
]
S = {s['id']: s for s in situations}
P, PR, TD, BM, CM, MO, SB, AR, YS, TC, GC = [s['id'] for s in situations]

# Hand assignments, reviewed against each summary. Keyed by the last six digits of the id.
assign = {
 '599560': [P], '482834': [GC, SB], '501599': [BM], '738762': [TC, GC], '983937': [BM, CM],
 '366943': [SB], '701871': [YS, PR], '159424': [CM, BM], '155408': [PR], '232289': [P],
 '318071': [PR, BM], '214693': [GC], '392734': [P], '755449': [PR, MO], '626879': [MO],
 '436046': [P], '858700': [MO], '781438': [P], '578827': [P], '748510': [MO],
 '658854': [SB], '840313': [CM, BM], '235870': [MO], '019909': [P, MO], '052776': [PR, MO],
 '670521': [AR], '004544': [AR, PR], '560412': [CM, BM], '285598': [P], '295690': [PR, AR, CM],
 '506351': [CM], '015520': [P, MO], '089861': [CM], '515294': [CM, BM], '440453': [GC],
 '766970': [P], '595770': [MO, GC], '261825': [MO], '397771': [CM, BM], '616032': [AR],
 '658196': [MO, SB], '408285': [BM, SB], '538535': [P, MO], '634542': [P], '415467': [YS, PR],
 '516345': [PR, SB], '568263': [MO], '916028': [CM, BM], '871672': [YS, PR], '909244': [TC],
 '288691': [P, CM, MO], '048497': [P], '288887': [SB], '739534': [BM, SB], '542157': [AR],
 '740243': [CM, AR], '389543': [PR, BM, AR], '521792': [BM], '487226': [MO], '641238': [TC],
 '949224': [P], '189920': [GC], '641930': [GC], '721067': [TD], '289600': [TD],
 '862797': [TD], '028481': [TD], '995840': [PR, MO], '691904': [TD], '718466': [TD],
 '215235': [TD], '405186': [TD], '865920': [TD], '379072': [TD], '623552': [TD],
 '575041': [TD], '875458': [TC, PR], '040064': [TD], '803910': [TD], '432452': [TD],
 '679680': [AR], '783808': [YS], '501312': [YS, SB], '907008': [TD], '623621': [YS],
 '673664': [YS], '599105': [YS], '894663': [YS, TC], '231937': [YS], '484097': [YS],
 '880449': [TD], '081920': [BM, CM], '817664': [TC], '116096': [PR], '732032': [PR],
 '586432': [PR], '937088': [TC, YS], '166848': [PR, YS], '191296': [MO, P], '406272': [AR, BM],
 '840321': [GC], '870016': [GC], '228928': [MO], '345280': [MO], '914560': [PR],
 '636096': [AR, P], '402112': [SB], '559744': [TD], '477378': [TD], '124736': [BM, CM],
 '112256': [BM, CM], '089328': [P], '666949': [CM], '283560': [CM, P], '888692': [MO, AR],
 '838293': [BM, CM], '509052': [MO], '347176': [P, CM], '688732': [SB], '357199': [BM, CM],
 '931402': [MO, GC], '145372': [PR], '659450': [TC], '160030': [GC], '654743': [YS, SB],
 '822302': [MO], '526444': [TC, GC], '056883': [GC], '162941': [PR], '887830': [MO],
}
# Audience additions beyond what the situations imply.
extra_audience = {
 '599560': ['parent'], '191296': ['parent'], '509052': ['parent'], '654743': ['parent'],
 '089328': ['parent'], '345280': ['parent'], '931402': ['parent'],
}
# Idea labels for weekly entries that arrived without any, plus small fixes.
ideas_fill = {
 '666949': ['Mental rehearsal', 'Preparation'],
 '283560': ['Controllable actions', 'Long-range goals', 'Daily actions', 'Adaptability'],
 '888692': ['Meaningful goals', 'Daily actions', 'Adversity rehearsal', 'Recovering after success'],
 '838293': ['Adversity rehearsal', 'Controllable actions', 'Preparation'],
 '509052': ['Recovery', 'Support systems'],
 '347176': ['Meaningful goals', 'Daily actions', 'Controllable actions', 'Adversity rehearsal', 'Mental rehearsal'],
 '688732': ['Adaptability', 'Controllable actions'],
 '357199': ['Adversity rehearsal', 'Preparation', 'Adaptability'],
 '931402': ['Personal responsibility', 'Consistency'],
 '145372': ['Training quality', 'Meaningful goals', 'Individualized coaching'],
 '659450': ['Support systems', 'Personal responsibility', 'External accountability'],
 '160030': ['Individualized coaching'],
 '654743': ['Long-term development', 'Stretching limits'],
 '822302': ['Controllable actions', 'Personal responsibility'],
 '526444': ['Individualized coaching', 'Continuous improvement'],
 '056883': ['Learning from mentors', 'Continuous improvement'],
 '162941': ['Fundamentals'],
 '887830': ['Consistency', 'Personal responsibility'],
}
idea_aliases = {
 'Dream goals': 'Long-range goals',
 'Specific daily actions': 'Daily actions',
 'Visible reminders': 'Meaningful goals',
}
# Plain-language display names for the stored idea labels.
idea_names = {
 'Long-term perspective': 'Patience over time',
 'Recovering after success': 'Handling success',
 'Recovery': 'Rest and recovery',
 'Adversity rehearsal': 'Rehearsing adversity',
 'External accountability': 'Honest feedback',
 'Beyond talent': 'More than talent',
 'Stretching limits': 'Stretching limits',
 'Controllable actions': 'Focus on what you control',
}
principles = [
 dict(id='vision', title='From big goal to ordinary day',
      blurb='Start with a goal that means something, then work backward until it becomes today\'s practice.',
      ideas=['Long-range goals', 'Meaningful goals', 'Daily actions', 'Long-term perspective']),
 dict(id='practice', title='Quality practice, repeated',
      blurb='Practice makes habits permanent, so the standard of each repetition matters more than the volume.',
      ideas=['Training quality', 'Fundamentals', 'Repetition', 'Consistency', 'Stretching limits', 'Recovery']),
 dict(id='prepared', title='Prepared for anything',
      blurb='Rehearse the good race and the broken goggles. On the day, attend to the next thing you control.',
      ideas=['Preparation', 'Adversity rehearsal', 'Mental rehearsal', 'Adaptability', 'Controllable actions']),
 dict(id='confidence', title='Confidence is earned',
      blurb='Belief comes from evidence built in training, not from talent or pep talks.',
      ideas=['Earned confidence', 'Beyond talent']),
 dict(id='ownership', title='Ownership and growth',
      blurb='Athletes own their choices, keep a development focus and reset after wins as well as losses.',
      ideas=['Personal responsibility', 'Continuous improvement', 'Reviewing progress', 'Recovering after success']),
 dict(id='people', title='The people around the athlete',
      blurb='Coaches, teammates and families shape development, and each swimmer needs to be coached as an individual.',
      ideas=['Support systems', 'Individualized coaching', 'Long-term development', 'Learning from mentors', 'External accountability']),
]

# Rule fallback for future weekly entries the overlay has not seen yet.
rules = {
 'ideas': {
  'Long-range goals': [P], 'Meaningful goals': [P, MO], 'Daily actions': [P],
  'Training quality': [TD], 'Recovery': [TD], 'Fundamentals': [PR], 'Repetition': [PR],
  'Consistency': [MO], 'Preparation': [BM], 'Mental rehearsal': [CM], 'Earned confidence': [CM],
  'Controllable actions': [CM], 'Adversity rehearsal': [BM], 'Adaptability': [SB],
  'Long-term perspective': [SB], 'Long-term development': [YS], 'Beyond talent': [YS],
  'Support systems': [TC], 'Individualized coaching': [TC], 'Learning from mentors': [GC],
  'Recovering after success': [AR], 'Reviewing progress': [AR], 'Personal responsibility': [MO],
 },
 'keywords': [
  {'pattern': 'taper|championship|race day|performance day|big meet|before (a|the) (race|meet)', 'situation': BM},
  {'pattern': 'child|children|kids|youth|age.group|young swimmer|parent', 'situation': YS},
  {'pattern': 'setback|injur|plateau|slump|bad race|failure', 'situation': SB},
  {'pattern': 'visuali|mental rehearsal|confiden|relax', 'situation': CM},
  {'pattern': 'team value|culture|teammate', 'situation': TC},
  {'pattern': 'coaches|as a coach|mentor', 'situation': GC},
  {'pattern': 'yardage|volume|intensity|drill|technique|suit|kick|stroke', 'situation': TD},
 ],
}

known = set(by_suffix)
assert set(assign) == known, (known - set(assign), set(assign) - known)
all_ideas = set()
out_assign = {}
for s, sits in assign.items():
    tid = by_suffix[s]
    t = next(x for x in threads if x['id'] == tid)
    aud = []
    for sid in sits:
        assert sid in S, sid
        for a in S[sid]['audience']:
            if a not in aud: aud.append(a)
    for a in extra_audience.get(s, []):
        if a not in aud: aud.append(a)
    rec = {'situations': sits, 'audience': aud}
    if s in ideas_fill:
        rec['ideas'] = ideas_fill[s]
    out_assign[tid] = rec
    for i in rec.get('ideas') or t['ideas']:
        all_ideas.add(idea_aliases.get(i, i))

grouped = {i for p in principles for i in p['ideas']}
missing = all_ideas - grouped
assert not missing, missing

guide = {
 'schemaVersion': 1,
 'note': 'Reader-facing overlay. Situations and audiences were assigned with AI assistance and reviewed against each summary. A thread\'s own situations/audience fields, when present, take priority over this file; entries in neither place fall back to the rules.',
 'situations': situations,
 'principles': principles,
 'ideaAliases': idea_aliases,
 'ideaNames': idea_names,
 'assignments': out_assign,
 'rules': rules,
}
(repo / 'guide.json').write_text(json.dumps(guide, indent=1, ensure_ascii=False) + '\n')
from collections import Counter
c = Counter(x for v in out_assign.values() for x in v['situations'])
print({k: c[k] for k in S})
print(Counter(x for v in out_assign.values() for x in v['audience']))
print(len(out_assign), 'assigned;', len(all_ideas), 'ideas')
