def generate_graph_relations(repos):
    all_topics = set()
    for repo in repos:
        all_topics |= set(repo['topics'])

    # print("all topics:", ', '.join(all_topics))

    # Assign topic IDs
    topic_list = list(all_topics)
    topic_id_map = {topic: i for i, topic in enumerate(topic_list)}

    nodes = []
    # Topic nodes
    for i, topic in enumerate(topic_list):
        nodes.append({"id": i, "name": topic, "type": "topic"})

    # Repo nodes
    for i, repo in enumerate(repos):
        repo_id = i + len(topic_list)
        nodes.append({"id": repo_id, "name": repo['name'], "type": "repo"})

    # print("nodes:", nodes)

    # Links
    links = []
    for i, repo in enumerate(repos):
        repo_id = i + len(topic_list)
        for topic in repo['topics']:
            topic_id = topic_id_map[topic]
            links.append({"source": repo_id, "target": topic_id})

    # print("links:", links)

    return nodes, links
